/**
 * @file blogModel.js
 * @description Mongoose schema and model for community blog posts and articles.
 * @architecture Manages member-authored articles, sectioned content blocks, categorization, and publication statuses.
 * @agent_note Author references Member model; supports draft, published, and archived publication lifecycles.
 */

import mongoose from "mongoose";

/**
 * Mongoose schema definition for community blog posts.
 */
const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    readTime: { type: Number, required: true },
    image: { type: String, required: true },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
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

/**
 * @module Blog
 */
export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);