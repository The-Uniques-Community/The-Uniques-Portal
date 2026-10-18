/**
 * @file blogRoute.js
 * @description Community blog publication router handling public article reading and authenticated member authoring/editing.
 * @architecture Mounted at `/api/blogs` in server/index.js, dividing public blog feeds from authenticated member article management.
 * @agent_note Protected endpoints require `verifyToken` middleware and rely on `req.user.id` or `req.user._id` in the blog controller.
 */
import express from 'express';
import { 
  createBlog, 
  getAllBlogs, 
  getMyBlogs,
  getBlogsByMember, 
  editBlog, 
  deleteBlogById 
} from '../../controller/member/blogController.js';
import verifyToken from '../../middlewares/verifyToken.js';
 
const blogRouter = express.Router();

// Public routes - no authentication needed
blogRouter.get('/', getAllBlogs);
blogRouter.get('/member/:memberId', getBlogsByMember);

// Protected routes - require authentication
blogRouter.post('/', verifyToken, createBlog);
blogRouter.get('/my-blogs', verifyToken, getMyBlogs);
blogRouter.put('/:blogId', verifyToken, editBlog);
blogRouter.delete('/:blogId', verifyToken, deleteBlogById);

export default blogRouter;