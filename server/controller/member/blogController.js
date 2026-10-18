/**
 * @file blogController.js
 * @description Controller managing community blog creation, retrieval, updates, and deletion with pagination and author authorization.
 * @architecture Mounted at `/api/blogs`. Interfaces with `Blog` model and references `Member` model for author information.
 * @agent_note Only published blogs are visible to unauthenticated or non-admin users. Editing and deleting require authorship or admin role.
 */
import Blog from "../../models/member/blogModel.js";
import mongoose from "mongoose";

/**
 * @desc Create a new blog post
 * @route POST /api/blogs
 * @access Private (Member)
 * @body {string} title - Blog article title
 * @body {string} description - Summary or excerpt
 * @body {string} category - Blog category
 * @body {string} readTime - Estimated read duration
 * @body {string} image - Cover image URL
 * @body {Object[]} [subContents] - Content sections with heading and paragraph
 * @body {string[]} [tags] - Search tags/keywords
 * @body {string} [status='published'] - Publication status
 * @returns {Object} 201 - JSON response with created blog document
 * @returns {Object} 401 - Authentication required error
 * @returns {Object} 500 - Server error
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
 * @desc Get all blogs with author details and pagination
 * @route GET /api/blogs
 * @access Public
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 * @query {string} [category] - Filter by category
 * @query {string} [status] - Filter by status (allowed for member/admin)
 * @returns {Object} 200 - JSON response with blog list and pagination metadata
 * @returns {Object} 500 - Server error
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
 * @desc Get blogs authored by the currently authenticated member
 * @route GET /api/blogs/my-blogs
 * @access Private (Member)
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 * @returns {Object} 200 - JSON response with member's blogs and pagination metadata
 * @returns {Object} 401 - Authentication required error
 * @returns {Object} 500 - Server error
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
 * @desc Get blogs published by a specific member ID
 * @route GET /api/blogs/member/:memberId
 * @access Public
 * @params {string} memberId - Member author document ID
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 * @returns {Object} 200 - JSON response with member's blogs and pagination metadata
 * @returns {Object} 400 - Invalid member ID format
 * @returns {Object} 500 - Server error
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
 * @desc Edit an existing blog post
 * @route PUT /api/blogs/:blogId
 * @access Private (Author or Admin)
 * @params {string} blogId - Blog document ID
 * @body {Object} updates - Updated blog post fields
 * @returns {Object} 200 - JSON response with updated blog document
 * @returns {Object} 400 - Invalid blog ID format
 * @returns {Object} 401 - Authentication required error
 * @returns {Object} 403 - Forbidden if user is not author or admin
 * @returns {Object} 404 - If blog not found
 * @returns {Object} 500 - Server error
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
    const { title, content, tags, coverImage, summary } = req.body;
    const allowedUpdates = {};
    if (title !== undefined) allowedUpdates.title = title;
    if (content !== undefined) allowedUpdates.content = content;
    if (tags !== undefined) allowedUpdates.tags = tags;
    if (coverImage !== undefined) allowedUpdates.coverImage = coverImage;
    if (summary !== undefined) allowedUpdates.summary = summary;
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
      { $set: allowedUpdates },
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
 * @desc Delete a blog post by ID
 * @route DELETE /api/blogs/:blogId
 * @access Private (Author or Admin)
 * @params {string} blogId - Blog document ID
 * @returns {Object} 200 - JSON response with success message
 * @returns {Object} 400 - Invalid blog ID format
 * @returns {Object} 401 - Authentication required error
 * @returns {Object} 403 - Forbidden if user is not author or admin
 * @returns {Object} 404 - If blog not found
 * @returns {Object} 500 - Server error
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