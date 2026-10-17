import mongoose from 'mongoose';

const dbconnect = () => {
	mongoose.connect(process.env.MONGODB_URI);

	const connection = mongoose.connection;

	connection.once('open', () => {
		console.log('MongoDB database connection established successfully');
	});
}

export default dbconnect;
