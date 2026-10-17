import { Container, Typography, Grid, Box, Button } from "@mui/material";
import BlogCard2 from "@/utils/Card/BlogCard2";

const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Tech Communities",
      subtitle: "How communities drive innovation and learning",
      imgSrc: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dg"
    },
    {
      id: 2,
      title: "Building Inclusive Developer Communities",
      subtitle: "Creating spaces where everyone belongs",
      imgSrc: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: 3,
      title: "From Beginner to Pro: Learning Paths",
      subtitle: "Structured approaches to mastering new skills",
      imgSrc: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];

  return (
    <Box 
      sx={{ 
        py: 8,
        backgroundColor: '#f8f9fa'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: '#CA0019',
              fontWeight: 600,
              letterSpacing: 1.5
            }}
          >
            OUR INSIGHTS
          </Typography>
          
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              mb: 2,
              color: '#000'
            }}
          >
            Latest Blog Posts
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              maxWidth: '650px',
              mx: 'auto',
              color: 'text.secondary'
            }}
          >
            Discover the latest insights, tutorials, and community stories from The Uniques Community
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {blogPosts.map(post => (
            <Grid item xs={12} md={4} key={post.id}>
              <BlogCard2 
                title={post.title} 
                subtitle={post.subtitle} 
                imgSrc={post.imgSrc} 
              />
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            sx={{ 
              borderColor: '#CA0019',
              color: '#CA0019',
              borderRadius: '50px',
              px: 4,
              py: 1,
              '&:hover': {
                borderColor: '#A00014',
                backgroundColor: 'rgba(202, 0, 25, 0.04)'
              }
            }}
          >
            View All Posts
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default BlogSection;
