import mongoose from 'mongoose';
import dotenv from 'dotenv';

const dbconnect = async () => {
	if (mongoose.connection.readyState >= 1) {
		return;
	}

	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('MongoDB database connection established successfully');
	} catch (error) {
		console.error('MongoDB database connection error:', error);
	}
};

export default dbconnect;
