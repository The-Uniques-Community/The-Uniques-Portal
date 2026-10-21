/**
 * @file dbConfig.js
 * @description Enterprise-grade MongoDB connection lifecycle manager with global connection caching,
 * single-flight connection pooling, serverless freeze/thaw resilience, and environment-aware scaling.
 * @architecture Central database gateway supporting Vercel Serverless Functions and standalone Express runtimes.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Ensure environment variables are loaded across all execution contexts
try {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	dotenv.config({ path: path.resolve(__dirname, '../../.env') });
	dotenv.config({ path: path.resolve(__dirname, '../.env') });
} catch {
	// Fallback for bundled execution contexts
}
dotenv.config();

// 2. Global connection cache initialization (persists across warm serverless invocations)
let cached = globalThis._mongooseCache || global._mongooseCache;
if (!cached) {
	cached = globalThis._mongooseCache = global._mongooseCache = { conn: null, promise: null };
}

// Attach one-time connection event listeners for proactive cache invalidation
if (!globalThis._mongooseListenersAttached) {
	mongoose.connection.on('disconnected', () => {
		console.warn('⚠️ [MongoDB] Connection disconnected. Invalidating cached connection.');
		if (globalThis._mongooseCache) {
			globalThis._mongooseCache.conn = null;
			globalThis._mongooseCache.promise = null;
		}
	});
	mongoose.connection.on('error', (err) => {
		console.error('❌ [MongoDB] Connection error event:', err.message);
	});
	globalThis._mongooseListenersAttached = true;
}

// 3. Environment detection
const isServerless = Boolean(
	process.env.VERCEL ||
	process.env.AWS_LAMBDA_FUNCTION_NAME ||
	process.env.NETLIFY
);

/**
 * Resolves the MongoDB connection string from supported environment variables.
 * @returns {string} Sanitized connection URI
 * @throws {Error} If no valid connection URI is configured
 */
const resolveMongoUri = () => {
	const rawUri =
		process.env.MONGODB_URI ||
		process.env.MONGO_URI ||
		process.env.MONGODB_URL ||
		process.env.DATABASE_URL;

	const mongoUri = rawUri ? rawUri.trim().replace(/^["']|["']$/g, '') : null;

	if (!mongoUri) {
		const visibleKeys = Object.keys(process.env)
			.filter((k) => !k.includes('SECRET') && !k.includes('PASS') && !k.includes('KEY'))
			.join(', ');
		console.error('❌ MONGODB_URI is missing. Available environment keys:', visibleKeys);
		throw new Error(
			'MONGODB_URI is not defined in environment variables! Please configure MONGODB_URI in your environment settings and redeploy.'
		);
	}

	return mongoUri;
};

/**
 * Establishes or returns an active MongoDB connection using Mongoose.
 * Implements single-flight promise caching to prevent race conditions during cold starts.
 *
 * @returns {Promise<typeof mongoose>} Active Mongoose instance with readyState === 1
 */
const dbconnect = () => {
	// Check for active cached connection (readyState 1 = connected)
	if (mongoose.connection.readyState === 1) {
		if (!cached.conn) cached.conn = mongoose;
		if (!cached.promise) cached.promise = Promise.resolve(cached.conn);
		return cached.promise;
	}

	// If connection is in-flight (readyState 2 = connecting), await existing promise
	if (mongoose.connection.readyState === 2) {
		if (cached.promise) return cached.promise;
		return mongoose.connection.asPromise().then(() => mongoose);
	}

	// If connection is dropped (0 = disconnected) or disconnecting (3), purge stale cache
	if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
		cached.conn = null;
		cached.promise = null;
	}

	// Single-flight mutex: if a connection is already in-flight, await the existing promise
	if (!cached.promise) {
		let mongoUri;
		try {
			mongoUri = resolveMongoUri();
		} catch (error) {
			return Promise.reject(error);
		}
		const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');

		// Build connection options tailored to runtime environment
		const options = {
			serverSelectionTimeoutMS: 5000, // Fail fast (5s) before Vercel gateway timeout (10s/15s)
			socketTimeoutMS: 45000,         // Clean up stuck sockets after 45s
			heartbeatFrequencyMS: 10000,    // Detect dead/zombie sockets every 10s
			family: 4,                      // Force IPv4 to prevent IPv6 DNS timeout delays on cloud lambdas
			maxPoolSize: isServerless
				? 10
				: (parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 50),
			minPoolSize: isServerless ? 0 : 5,
			maxIdleTimeMS: isServerless ? 10000 : 30000,
			bufferCommands: true,           // Allow transient primary failover buffering
			// Backwards compatibility: only set dbName if explicitly provided via env
			...(process.env.DB_NAME && process.env.DB_NAME.trim() !== ''
				? { dbName: process.env.DB_NAME.trim() }
				: {}),
		};

		console.log(`Connecting to MongoDB (${maskedUri}) [Context: ${isServerless ? 'Serverless' : 'Server'}]...`);

		cached.promise = mongoose
			.connect(mongoUri, options)
			.then((mongooseInstance) => {
				cached.conn = mongooseInstance;
				const activeDb = mongooseInstance.connection.db?.databaseName || 'unknown';
				console.log(`✅ MongoDB connection established successfully. Active Database: "${activeDb}"`);
				return mongooseInstance;
			})
			.catch((error) => {
				// Reset promise on rejection so subsequent requests can retry
				cached.promise = null;
				cached.conn = null;
				console.error('❌ MongoDB database connection error:', error.message);
				throw error;
			});
	}

	return cached.promise;
};

// 4. Graceful shutdown handler (restricted to long-running standalone servers)
if (!isServerless && typeof process.once === 'function') {
	const handleGracefulShutdown = async (signal) => {
		console.log(`\nReceived ${signal}. Gracefully closing MongoDB connection...`);
		try {
			if (mongoose.connection.readyState !== 0) {
				await mongoose.connection.close(false);
				console.log('MongoDB connection closed successfully.');
			}
			process.exit(0);
		} catch (err) {
			console.error('Error closing MongoDB connection:', err);
			process.exit(1);
		}
	};

	process.once('SIGINT', () => handleGracefulShutdown('SIGINT'));
	process.once('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
}

export default dbconnect;
