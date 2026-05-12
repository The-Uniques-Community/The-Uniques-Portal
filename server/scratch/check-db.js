import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkDB = async () => {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connection successful");
        
        const Member = mongoose.model('Member', new mongoose.Schema({ email: String }));
        const count = await Member.countDocuments();
        console.log("Member count:", count);
        
        const firstMember = await Member.findOne();
        console.log("First member ID:", firstMember?._id);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error("DB Check failed:", error);
    }
};

checkDB();
