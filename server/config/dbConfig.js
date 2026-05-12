import mongoose from 'mongoose';
import dotenv from 'dotenv';

const dbconnect = () => {
	mongoose.connect(process.env.MONGODB_URI);

	const connection = mongoose.connection;

	connection.once('open', () => {
		console.log('MongoDB database connection established successfully');
	});
}

export default dbconnect;
