import React from 'react';
import { 
  Typography, 
  Box,
  Container,
  Paper,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const HomeContent = () => {
  const location = useLocation();
  
  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={contentVariants}
    >
      <Box sx={{ 
        height: '60vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80)',
        backgroundSize: 'cover',
        color: 'white',
        textAlign: 'center',
        p: 4
      }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Success Stories
        </Typography>
        <Typography variant="h5" sx={{ maxWidth: 800, mb: 4 }}>
          Inspiring journeys of The Uniques Community members who have achieved remarkable success in their careers.
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 700 }}>
          Select a community member from the sidebar to explore their journey, achievements, and the impact of being part of The Uniques Community.
        </Typography>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>The Uniques Difference</Typography>
          <Typography paragraph>
            At The Uniques Community, we pride ourselves on nurturing talent and providing the resources, mentorship, 
            and opportunities that help our members achieve extraordinary success. Our comprehensive approach to 
            professional development focuses on technical skills, leadership abilities, and personal growth.
          </Typography>
          <Typography paragraph>
            The success stories showcased here are testament to the power of community, dedication, and the unique 
            approach we take to preparing our members for the challenges of the tech industry.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ px: 4, py: 1 }}
            >
              Join The Uniques Community
            </Button>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
};

export default HomeContent;
