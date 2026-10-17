import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbconnect = async () => {
	if (mongoose.connection.readyState >= 1) {
		return;
	}

	if (!process.env.MONGODB_URI) {
		throw new Error("MONGODB_URI is not defined in environment variables! Please add it to your Vercel Project Settings.");
	}

	try {
		await mongoose.connect(process.env.MONGODB_URI, {
			serverSelectionTimeoutMS: 5000,
		});
		console.log('MongoDB database connection established successfully');
	} catch (error) {
		console.error('MongoDB database connection error:', error);
		throw error;
	}
};

export default dbconnect;
