import mongoose from 'mongoose'
const fileSchema = new mongoose.Schema({
    fileName: {
        type: String,
    },
    fileUrl: {
        type: String,

    },
    fileId: {
        type: String,

    },
    fileOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
    },
});

const File = mongoose.model('File', fileSchema)
export default File;