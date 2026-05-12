import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Button,
  useMediaQuery,
  Drawer,
  Toolbar as MuiToolbar
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/system';
import { successStories } from '@/views/Landing/SuccessStories/successStoriesData';
import Sidebar from '@/utils/Sidebar/index'
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme with #ca0019 color
const theme = createTheme({
  palette: {
    primary: {
      main: '#ca0019',
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    matteDark: {
      main: 'rgba(0, 0, 0, 0.9)',
      light: 'rgba(0, 0, 0, 0.75)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  marginLeft: 280,
  width: 'calc(100% - 280px)',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    backgroundColor: theme.palette.matteDark.main,
  },
}));

const SuccessLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="success-stories-page" sx={{ display: 'flex' }}>
        {/* Mobile App Bar */}
        <StyledAppBar position="fixed">
          <MuiToolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              The Uniques
            </Typography>
            <Button 
              component={Link} 
              to="/success-stories"
              color="inherit" 
              startIcon={<HomeIcon />}
            >
              Home
            </Button>
          </MuiToolbar>
        </StyledAppBar>
        
        {/* Sidebar - Permanent on desktop, drawer on mobile */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ 
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { width: 280 } 
            }}
          >
            <Sidebar 
              students={successStories} 
              onDrawerToggle={handleDrawerToggle}
              isDrawerOpen={mobileOpen}
            />
          </Drawer>
        ) : (
          <Sidebar 
            students={successStories}
            isDrawerOpen={true}
          />
        )}

        {/* Main Content */}
        <ContentWrapper>
          {/* Toolbar spacer for mobile */}
          {isMobile && <MuiToolbar />}
          
          {/* This is where the child routes will render */}
          <Outlet />
        </ContentWrapper>
      </Box>
    </ThemeProvider>
  );
};

export default SuccessLayout;
