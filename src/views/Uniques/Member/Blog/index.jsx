import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  InputAdornment,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/config";

// Base API URL
const API_BASE_URL = `${BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Always include credentials
  headers: {
    "Content-Type": "application/json",
  }
});

// Add request interceptor to handle authentication errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page or handle unauthorized access
      console.error("Authentication error: Not authorized");
      // You could redirect here: window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const BlogManagement = () => {
  // State for blog form
  const [blogForm, setBlogForm] = useState({
    title: "",
    description: "",
    category: "",
    readTime: "",
    image: "",
    tags: [],
    subContents: [{ heading: "", paragraph: "" }],
    status: "draft",
  });

  // State for search and blogs list
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState(null);

  // UI states
  const [showForm, setShowForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    blogId: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [tagInput, setTagInput] = useState("");

  // Categories for dropdown
  const categories = [
    "Technical",
    "Educational",
    "Community",
    "Event",
    "News",
    "Personal",
    "Tutorial",
    "Career",
    "Other",
  ];

  // Fetch member's blogs with cookies
  const fetchMemberBlogs = async () => {
    setIsLoading(true);
    try {
      // Use the custom axios instance
      const response = await api.get('/blogs/my-blogs');

      // Check if data exists and has expected structure
      if (response.data && response.data.data) {
        // Sort by createdAt in descending order (newest first)
        const sortedBlogs = response.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setBlogs(sortedBlogs);
        setFilteredBlogs(sortedBlogs);
      } else {
        setBlogs([]);
        setFilteredBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);

      // Handle authorization errors
      if (error.response?.status === 401) {
        showSnackbar("Please login to view your blogs", "error");
      } else {
        showSnackbar(
          "Failed to fetch your blogs. " +
            (error.response?.data?.message || ""),
          "error"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchMemberBlogs();
  }, []);

  // Filter blogs when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (blog.tags &&
            blog.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
      setFilteredBlogs(filtered);
    }
  }, [searchTerm, blogs]);

  // Handle form input changes
  const handleInputChange = (e) => {
    setBlogForm({
      ...blogForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle subcontent changes
  const handleSubContentChange = (index, field, value) => {
    const updatedSubContents = [...blogForm.subContents];
    updatedSubContents[index] = {
      ...updatedSubContents[index],
      [field]: value,
    };

    setBlogForm({
      ...blogForm,
      subContents: updatedSubContents,
    });
  };

  // Add new subcontent section
  const addSubContent = () => {
    setBlogForm({
      ...blogForm,
      subContents: [...blogForm.subContents, { heading: "", paragraph: "" }],
    });
  };

  // Remove subcontent section
  const removeSubContent = (index) => {
    const updatedSubContents = blogForm.subContents.filter(
      (_, i) => i !== index
    );
    setBlogForm({
      ...blogForm,
      subContents: updatedSubContents,
    });
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !blogForm.tags.includes(tagInput.trim())) {
      setBlogForm({
        ...blogForm,
        tags: [...blogForm.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setBlogForm({
      ...blogForm,
      tags: blogForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Create new blog with cookie authentication
  const handleSubmitBlog = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (
        !blogForm.title ||
        !blogForm.description ||
        !blogForm.category ||
        !blogForm.image ||
        !blogForm.readTime
      ) {
        showSnackbar("Please fill all required fields", "error");
        setIsLoading(false);
        return;
      }

      // Validate subcontent
      if (blogForm.subContents.some((section) => !section.paragraph.trim())) {
        showSnackbar("All paragraph sections must have content", "error");
        setIsLoading(false);
        return;
      }

      if (isEditing) {
        // Update existing blog
        await api.put(`/blogs/${currentBlogId}`, blogForm);
        showSnackbar("Blog updated successfully!", "success");
      } else {
        // Create new blog
        await api.post('/blogs', blogForm);
        showSnackbar("Blog created successfully!", "success");
      }

      // Reset form and refresh blogs list
      resetForm();
      fetchMemberBlogs();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving blog:", error);

      // Handle authorization errors
      if (error.response?.status === 401) {
        showSnackbar("Please login to publish blogs", "error");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          (isEditing ? "Failed to update blog." : "Failed to create blog.");

        showSnackbar(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete blog with confirmation
  const handleDeleteBlog = async (blogId) => {
    try {
      setIsLoading(true);

      await api.delete(`/blogs/${blogId}`);

      // Update blogs list after deletion
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
      showSnackbar("Blog deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting blog:", error);

      // Handle authorization errors
      if (error.response?.status === 401) {
        showSnackbar("Please login to delete blogs", "error");
      } else if (error.response?.status === 403) {
        showSnackbar("You do not have permission to delete this blog", "error");
      } else {
        showSnackbar(
          "Failed to delete blog: " + (error.response?.data?.message || ""),
          "error"
        );
      }
    } finally {
      setConfirmDialog({ isOpen: false, blogId: null });
      setIsLoading(false);
    }
  };

  // Edit blog - load data into form
  const handleEditBlog = (blog) => {
    setBlogForm({
      title: blog.title,
      description: blog.description,
      category: blog.category,
      readTime: blog.readTime,
      image: blog.image,
      tags: blog.tags || [],
      subContents:
        blog.subContents?.length > 0
          ? blog.subContents
          : [{ heading: "", paragraph: "" }],
      status: blog.status || "draft",
    });
    setCurrentBlogId(blog._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // Reset form to defaults
  const resetForm = () => {
    setBlogForm({
      title: "",
      description: "",
      category: "",
      readTime: "",
      image: "",
      tags: [],
      subContents: [{ heading: "", paragraph: "" }],
      status: "draft",
    });
    setTagInput("");
    setIsEditing(false);
    setCurrentBlogId(null);
  };

  // Show snackbar alert
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        My Blogs
      </Typography>

      {/* Blog Management Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={showForm ? <CloseIcon /> : <AddIcon />}
          color={showForm ? "secondary" : "primary"}
          onClick={() => {
            if (showForm) {
              resetForm();
            }
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "Create New Blog"}
        </Button>

        <TextField
          variant="outlined"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: "250px" } }}
        />
      </Box>

      {/* Blog Creation/Editing Form */}
      {showForm && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {isEditing ? "Edit Blog" : "Create New Blog"}
          </Typography>

          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Blog Title"
                value={blogForm.title}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Brief Description"
                value={blogForm.description}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={3}
                variant="outlined"
                helperText="A short summary of your blog (will appear in blog listings)"
              />
            </Grid>

            {/* Category and Read Time */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={blogForm.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="readTime"
                label="Read Time (minutes)"
                value={blogForm.readTime}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: "1" }}
                variant="outlined"
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12}>
              <TextField
                name="image"
                label="Cover Image URL"
                value={blogForm.image}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
                helperText="Provide a URL to an image for your blog cover"
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags..."
                    size="small"
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    sx={{ mr: 1, flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAddTag}
                  >
                    Add
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {blogForm.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>

            {/* Blog Status */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={blogForm.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Dynamic SubContent Sections */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Blog Content
              </Typography>

              {blogForm.subContents.map((section, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{ p: 2, mb: 3, position: "relative" }}
                >
                  <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeSubContent(index)}
                      disabled={blogForm.subContents.length <= 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Section {index + 1}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Section Heading (Optional)"
                        value={section.heading}
                        onChange={(e) =>
                          handleSubContentChange(
                            index,
                            "heading",
                            e.target.value
                          )
                        }
                        fullWidth
                        variant="outlined"
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Content"
                        value={section.paragraph}
                        onChange={(e) =>
                          handleSubContentChange(
                            index,
                            "paragraph",
                            e.target.value
                          )
                        }
                        fullWidth
                        required
                        multiline
                        rows={4}
                        variant="outlined"
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={addSubContent}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Content Section
              </Button>
            </Grid>

            {/* Form Actions */}
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleSubmitBlog}
                disabled={isLoading}
              >
                {isEditing ? "Update Blog" : "Publish Blog"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Blogs List */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {filteredBlogs.length > 0
            ? `Your Blogs (${filteredBlogs.length})`
            : searchTerm
            ? "No matching blogs found"
            : "You haven't created any blogs yet"}
        </Typography>

        {isLoading && !showForm ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredBlogs.map((blog) => (
              <Grid item xs={12} md={6} lg={4} key={blog._id}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={blog.image}
                    alt={blog.title}
                    sx={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x200?text=Image+Not+Available";
                    }}
                  />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="div"
                        gutterBottom
                        noWrap
                        sx={{ maxWidth: "70%" }}
                      >
                        {blog.title}
                      </Typography>

                      <Chip
                        label={blog.status}
                        size="small"
                        color={
                          blog.status === "published" ? "success" : "default"
                        }
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {formatDate(blog.createdAt)} • {blog.readTime} min read
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1.5,
                        height: "40px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {blog.description}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={blog.category}
                        size="small"
                        color="primary"
                        sx={{ mr: 0.5 }}
                      />
                      {blog.tags?.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {blog.tags?.length > 2 && (
                        <Chip
                          label={`+${blog.tags.length - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditBlog(blog)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() =>
                        setConfirmDialog({ isOpen: true, blogId: blog._id })
                      }
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, blogId: null })}
      >
        <DialogTitle>Delete Blog?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this blog? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ isOpen: false, blogId: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteBlog(confirmDialog.blogId)}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BlogManagement;
