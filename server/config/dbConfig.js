import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from both server/ and root directories for all execution contexts
try {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	dotenv.config({ path: path.resolve(__dirname, '../../.env') });
	dotenv.config({ path: path.resolve(__dirname, '../.env') });
} catch {
	// ignore if fileURLToPath fails in non-standard context
}
dotenv.config();

const dbconnect = async () => {
	if (mongoose.connection.readyState >= 1) {
		return;
	}

	// Support all common environment variable names for MongoDB
	const rawUri =
		process.env.MONGODB_URI ||
		process.env.MONGO_URI ||
		process.env.MONGODB_URL ||
		process.env.DATABASE_URL;

	// Strip accidental wrapping quotes or whitespace
	const mongoUri = rawUri ? rawUri.trim().replace(/^["']|["']$/g, '') : null;

	if (!mongoUri) {
		const visibleKeys = Object.keys(process.env)
			.filter((k) => !k.includes('SECRET') && !k.includes('PASS') && !k.includes('KEY'))
			.join(', ');
		console.error('❌ MONGODB_URI is missing. Available environment keys:', visibleKeys);
		throw new Error(
			'MONGODB_URI is not defined in environment variables! Please add MONGODB_URI to your Vercel Project Settings (Project -> Settings -> Environment Variables) and REDEPLOY.'
		);
	}

	try {
		const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
		console.log(`Connecting to MongoDB (${maskedUri})...`);

		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 5000,
		});
		console.log('MongoDB database connection established successfully');
	} catch (error) {
		console.error('MongoDB database connection error:', error.message);
		throw error;
	}
};

export default dbconnect;
