import Blog from "../../models/member/blogModel.js";
import mongoose from "mongoose";

/**
 * Create a new blog post
 * @route POST /api/blogs
 * @access Private (Member)
 */
export const createBlog = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }

    const { title, description, category, readTime, image, subContents, tags, status } = req.body;
    
    const authorId = req.user.id;
    
    // Create new blog with author reference
    const newBlog = new Blog({
      title,
      description,
      category,
      readTime,
      image,
      author: authorId,
      subContents: subContents || [{ heading: '', paragraph: 'Content goes here' }],
      tags: tags || [],
      status: status || 'published'
    });
    
    // Save the blog to database
    const savedBlog = await newBlog.save();
    
    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: savedBlog
    });
    
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message
    });
  }
};

/**
 * Get all blogs with author details
 * @route GET /api/blogs
 * @access Public
 */
export const getAllBlogs = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Optional filters
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // By default, only show published blogs to the public
    // If user is authenticated (req.user exists from verifyToken), handle status filtering
    if (!req.query.status && (!req.user || req.user.role !== 'admin')) {
      filter.status = 'published';
    } else if (req.query.status && req.user && (req.user.role === 'admin' || req.user.role === 'member')) {
      filter.status = req.query.status;
    }
    
    // Get total count for pagination info
    const totalCount = await Blog.countDocuments(filter);
    
    // Fetch blogs with author information
    const blogs = await Blog.find(filter)
      .populate('author', 'fullName profilePic email batch')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        totalBlogs: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        blogsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message
    });
  }
};

/**
 * Get blogs by current authenticated member
 * @route GET /api/blogs/my-blogs
 * @access Private (Member)
 */
export const getMyBlogs = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }
    
    // Get the authenticated user's ID from the token
    const userId = req.user.id;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter for the current user's blogs
    const filter = { author: userId };
    
    // Get total count for pagination info
    const totalCount = await Blog.countDocuments(filter);
    
    // Fetch blogs by this member
    const blogs = await Blog.find(filter)
      .populate('author', 'fullName profilePic email batch')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        totalBlogs: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        blogsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error("Error fetching user's blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your blogs",
      error: error.message
    });
  }
};

/**
 * Get blogs by a specific member
 * @route GET /api/blogs/member/:memberId
 * @access Public
 */
export const getBlogsByMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    
    // Validate member ID format
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID format"
      });
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter for published blogs only if not the author or admin
    const filter = { author: memberId };
    if (!req.user || (req.user.id.toString() !== memberId.toString() && req.user.role !== 'admin')) {
      filter.status = 'published';
    }
    
    // Get total count for pagination info
    const totalCount = await Blog.countDocuments(filter);
    
    // Fetch blogs by this member
    const blogs = await Blog.find(filter)
      .populate('author', 'fullName profilePic email batch')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        totalBlogs: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        blogsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error("Error fetching member blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch member's blogs",
      error: error.message
    });
  }
};

/**
 * Edit a blog post
 * @route PUT /api/blogs/:blogId
 * @access Private (Author or Admin)
 */
export const editBlog = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }
    
    const blogId = req.params.blogId;
    const updates = req.body;
    const userId = req.user.id;
    
    // Validate blog ID format
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format"
      });
    }
    
    // Find the blog
    const blog = await Blog.findById(blogId);
    
    // Check if blog exists
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    // Check if user is the author of the blog or an admin
    if (blog.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this blog"
      });
    }
    
    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $set: updates },
      { new: true }
    ).populate('author', 'fullName profilePic email batch');
    
    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog
    });
    
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message
    });
  }
};

/**
 * Delete a blog post by ID
 * @route DELETE /api/blogs/:blogId
 * @access Private (Author or Admin)
 */
export const deleteBlogById = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }
    
    const blogId = req.params.blogId;
    const userId = req.user.id;
    
    // Validate blog ID format
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format"
      });
    }
    
    // Find the blog
    const blog = await Blog.findById(blogId);
    
    // Check if blog exists
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    // Check if user is the author of the blog or an admin
    if (blog.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this blog"
      });
    }
    
    // Delete the blog
    await Blog.findByIdAndDelete(blogId);
    
    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message
    });
  }
};