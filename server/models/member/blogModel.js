import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    readTime: { type: Number, required: true },
    image: { type: String, required: true },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Member",
      required: true 
    },
    subContents: [
      {
        heading: { type: String, required: false },
        paragraph: { type: String, required: true },
      },
    ],
    tags: [{ type: String }],
    status: { 
      type: String, 
      enum: ['draft', 'published', 'archived'],
      default: 'published' 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);