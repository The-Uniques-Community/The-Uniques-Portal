/**
 * @file verify_db_conn.js
 * @description Automated verification suite for the core MongoDB connection lifecycle architecture.
 * Tests:
 * 1. Concurrent calls to dbconnect() returning the exact same cached Promise instance.
 * 2. Resolution to readyState === 1.
 * 3. Active database name check (preserving "test" and records).
 * 4. Warm call promise caching.
 * 5. Disconnect and reconnect resetting the promise and re-establishing connection.
 */

import assert from 'assert';
import mongoose from 'mongoose';
import dbconnect from '../config/dbConfig.js';

async function runVerification() {
	console.log('====================================================');
	console.log('🧪 Starting Core Database Connection Verification');
	console.log('====================================================\n');

	let totalTests = 0;
	let passedTests = 0;

	const test = async (name, fn) => {
		totalTests++;
		try {
			await fn();
			passedTests++;
			console.log(`✅ [PASS] ${name}`);
		} catch (error) {
			console.error(`❌ [FAIL] ${name}`);
			console.error(`   Error: ${error.message}`);
			throw error;
		}
	};

	try {
		// Ensure initial state is clean
		if (mongoose.connection.readyState !== 0) {
			await mongoose.connection.close(false);
		}
		if (global._mongooseCache) {
			global._mongooseCache.conn = null;
			global._mongooseCache.promise = null;
		}

		// TEST 1: Single-flight concurrent promise memoization
		let initialPromises;
		await test('Concurrent calls to dbconnect() return the exact same cached Promise instance', async () => {
			assert(global._mongooseCache, 'global._mongooseCache must be initialized');
			assert.strictEqual(global._mongooseCache.promise, null, 'Cache promise should be null before connect');

			// Trigger 10 concurrent calls
			initialPromises = Array.from({ length: 10 }, () => dbconnect());

			assert.strictEqual(initialPromises.length, 10);
			const firstPromise = initialPromises[0];
			assert(firstPromise instanceof Promise, 'dbconnect() must return a Promise instance');

			for (let i = 1; i < initialPromises.length; i++) {
				assert.strictEqual(
					initialPromises[i],
					firstPromise,
					`Promise index ${i} must be identical to Promise index 0 (single-flight cache)`
				);
			}

			assert.strictEqual(
				global._mongooseCache.promise,
				firstPromise,
				'global._mongooseCache.promise must hold the in-flight Promise instance'
			);
		});

		// TEST 2: Resolution to readyState === 1
		await test('All concurrent promises resolve and mongoose.connection.readyState === 1', async () => {
			const results = await Promise.all(initialPromises);

			assert.strictEqual(results.length, 10);
			assert.strictEqual(
				mongoose.connection.readyState,
				1,
				`Expected readyState 1 (connected), got ${mongoose.connection.readyState}`
			);

			for (const res of results) {
				assert.strictEqual(res, mongoose, 'Each promise must resolve to the mongoose instance');
			}

			assert.strictEqual(
				global._mongooseCache.conn,
				mongoose,
				'global._mongooseCache.conn must hold the connected mongoose instance'
			);
		});

		// TEST 3: Active database name check & data continuity
		await test('Active database name check preserves default URI database ("test")', async () => {
			const activeDbName = mongoose.connection.db?.databaseName;
			assert(activeDbName, 'Active database name must be resolved');
			console.log(`   ℹ️ Active Database Name: "${activeDbName}"`);

			// If process.env.DB_NAME was not set, it should default to "test"
			if (!process.env.DB_NAME) {
				assert.strictEqual(
					activeDbName,
					'test',
					`Expected active database to be "test" to preserve existing collections, got "${activeDbName}"`
				);
			}

			// Verify query execution on members collection
			const membersCount = await mongoose.connection.db.collection('members').countDocuments();
			console.log(`   ℹ️ Verified "members" collection document count: ${membersCount}`);
			assert(typeof membersCount === 'number', 'Must be able to query members count');
		});

		// TEST 4: Warm cached connection returns immediately
		await test('Subsequent calls in readyState === 1 return resolved cached connection', async () => {
			const warmPromise = dbconnect();
			assert(warmPromise instanceof Promise, 'dbconnect() must return a Promise');
			const warmConn = await warmPromise;

			assert.strictEqual(warmConn, mongoose, 'Warm call must resolve to mongoose instance');
			assert.strictEqual(mongoose.connection.readyState, 1, 'Connection must remain in readyState 1');
		});

		// TEST 5: Disconnect and reconnect resets cache and re-establishes connection
		await test('Disconnect purges cache and subsequent dbconnect() re-establishes readyState 1', async () => {
			console.log('   ℹ️ Closing active connection...');
			await mongoose.connection.close(false);
			assert.strictEqual(
				mongoose.connection.readyState,
				0,
				`Expected readyState 0 (disconnected), got ${mongoose.connection.readyState}`
			);

			console.log('   ℹ️ Initiating reconnect with concurrent calls...');
			const reconnectPromises = Array.from({ length: 5 }, () => dbconnect());

			// Verify that a new promise was created (different from original)
			assert.notStrictEqual(
				reconnectPromises[0],
				initialPromises[0],
				'Reconnect must create a fresh Promise instance after disconnect'
			);

			// Verify all 5 reconnect calls share the same new promise
			for (let i = 1; i < reconnectPromises.length; i++) {
				assert.strictEqual(
					reconnectPromises[i],
					reconnectPromises[0],
					`Reconnect promise ${i} must match reconnect promise 0`
				);
			}

			// Await reconnect resolution
			await Promise.all(reconnectPromises);
			assert.strictEqual(
				mongoose.connection.readyState,
				1,
				`Expected readyState 1 after reconnect, got ${mongoose.connection.readyState}`
			);
			console.log('   ℹ️ Reconnect successfully established readyState 1');
		});

		console.log('\n====================================================');
		console.log(`🎉 All ${passedTests}/${totalTests} tests passed successfully!`);
		console.log('====================================================\n');
	} finally {
		// Clean up connection gracefully
		if (mongoose.connection.readyState !== 0) {
			await mongoose.connection.close(false);
		}
	}
}

runVerification()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.error('\n❌ Verification suite failed with unhandled error:', err);
		process.exit(1);
	});
