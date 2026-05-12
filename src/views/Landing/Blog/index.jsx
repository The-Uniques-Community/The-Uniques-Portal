import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Box, 
  IconButton, 
  Chip, 
  Paper, 
  TextField, 
  Typography, 
  Divider,
  FormGroup, 
  FormControlLabel, 
  Checkbox,
  Button,
  InputAdornment,
  Drawer,
  useMediaQuery,
  useTheme
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import BlogCard from "@/utils/Card/BlogCard";
import CelebrationComponent from "@/utils/Header";
import CallToAction from "../homComponents/CallToAction";
import { blogData } from "@/assets/dummyData/blogData";

const BlogPage = () => {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Extract unique categories from blogData
  const categories = [...new Set(blogData.map((blog) => blog.category || "Uncategorized"))];

  // Filtering logic with null checks
  const filteredBlogs = blogData.filter((blog) => {
    // Category filter (if no categories selected, show all)
    const categoryMatch = selectedCategories.length === 0 || 
      selectedCategories.includes(blog.category);
    
    // Search filter with null checks
    const searchMatch = searchQuery === "" || (
      (blog.title && blog.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (blog.content && blog.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (blog.tags && Array.isArray(blog.tags) && blog.tags.some(tag => 
        tag && tag.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
    
    return categoryMatch && searchMatch;
  });

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(item => item !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
  };

  // Filter sidebar content
  const filterContent = (
    <Box sx={{ 
      width: isMobile ? 280 : 260, 
      p: 3,
      height: '100%',
      backgroundColor: '#fff' // Keep filter background white
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color="#333">
          Filters
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileFilterOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search blogs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        size="small"
      />

      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1 }}>
        Categories
      </Typography>
      
      <FormGroup>
        {categories.map((category) => (
          <FormControlLabel
            key={category}
            control={
              <Checkbox 
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                size="small"
                sx={{
                  color: '#CA0019',
                  '&.Mui-checked': {
                    color: '#CA0019',
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {category || "Uncategorized"}
              </Typography>
            }
          />
        ))}
      </FormGroup>
      
      <Button 
        variant="outlined" 
        fullWidth 
        onClick={clearFilters}
        sx={{ 
          mt: 3, 
          color: '#CA0019', 
          borderColor: '#CA0019',
          '&:hover': {
            borderColor: '#CA0019',
            backgroundColor: 'rgba(202, 0, 25, 0.04)',
          }
        }}
      >
        Clear Filters
      </Button>
    </Box>
  );

  return (
    <div className="min-h-screen bg-transparent">
      <CelebrationComponent title="Shaping Perspectives → Read & Grow ✦" />

      <div className="flex">
        {/* Filter Sidebar - Desktop */}
        {!isMobile && (
          <Paper 
            elevation={1} 
            sx={{ 
              display: { xs: 'none', md: 'block' },
              position: 'sticky',
              top: 0,
              height: 'calc(100vh - 64px)',
              overflowY: 'auto',
              backgroundColor: '#fff' // Keep filter background white
            }}
          >
            {filterContent}
          </Paper>
        )}
        
        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="left"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
        >
          {filterContent}
        </Drawer>

        {/* Main Content - Transparent Background */}
        <div className="flex-1 lg:max-w-7xl md:max-w-5xl mx-auto py-12 mt-5 px-4 bg-transparent">
          <div className="flex justify-between items-center mb-6">
            <h1 className="lg:text-4xl text-2xl font-bold text-gray-800">
              Latest Blogs
            </h1>
            
            {/* Mobile filter button */}
            {isMobile && (
              <Button 
                startIcon={<FilterListIcon />}
                onClick={() => setMobileFilterOpen(true)}
                sx={{ color: '#CA0019' }}
              >
                Filters
              </Button>
            )}
          </div>
          
          {/* Results info */}
          <div className="mb-6">
            <Typography variant="body2" color="text.secondary">
              Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? 'result' : 'results'}
              {(selectedCategories.length > 0 || searchQuery) && (
                <Button 
                  size="small" 
                  onClick={clearFilters}
                  sx={{ ml: 1, color: '#CA0019', p: 0, minWidth: 'auto' }}
                >
                  Clear
                </Button>
              )}
            </Typography>
          </div>

          {/* Blog Grid - Cards will have their own backgrounds */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 place-items-center">
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog, index) => (
                <BlogCard 
                  key={index} 
                  {...blog} 
                  onClick={() => setSelectedBlog(blog)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <Typography variant="h6" color="text.secondary">
                  No blogs found matching your filters
                </Typography>
                <Button 
                  variant="text" 
                  onClick={clearFilters}
                  sx={{ 
                    mt: 2, 
                    color: '#CA0019'
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          <div className="py-8"></div>
        </div>
      </div>

      <CallToAction />
      <div className="py-8"></div>

      {/* Blog Modal - Semi-transparent Background */}
      <Modal
        open={!!selectedBlog}
        onClose={() => setSelectedBlog(null)}
        aria-labelledby="blog-title"
        aria-describedby="blog-content"
      >
        <Box className="fixed inset-0 overflow-auto" 
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent white
            backdropFilter: 'blur(5px)' // Slight blur effect
          }}
        >
          {selectedBlog && (
            <div className="max-w-6xl mx-auto p-6 bg-transparent">
              {/* Close Button */}
              <div className="flex justify-between items-center">
                <h2 id="blog-title" className="text-4xl font-bold text-gray-800">
                  {selectedBlog.title}
                </h2>
                <IconButton onClick={() => setSelectedBlog(null)}>
                  <CloseIcon className="text-gray-600" />
                </IconButton>
              </div>

              {/* Blog Meta Info */}
              <p className="text-gray-600 text-lg mt-2">
                {selectedBlog.category || "Uncategorized"} • {selectedBlog.readTime || "5"} Mins Read
              </p>

              {/* Blog Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedBlog.tags && selectedBlog.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    sx={{ 
                      backgroundColor: 'rgba(229, 231, 235, 0.7)'  // Semi-transparent gray
                    }} 
                  />
                ))}
              </div>

              {/* Blog Image */}
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full h-[400px] object-cover rounded-lg mt-6"
              />

              {/* Blog Content Sections */}
              <div
                id="blog-content"
                className="mt-6 text-gray-700 text-lg leading-7 space-y-6"
              >
                {selectedBlog.subContents && selectedBlog.subContents.map((section, index) => (
                  <div key={index}>
                    {section.heading && (
                      <h3 className="text-2xl font-semibold text-gray-800">
                        {section.heading}
                      </h3>
                    )}
                    <p className="mt-2">{section.paragraph}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default BlogPage;
