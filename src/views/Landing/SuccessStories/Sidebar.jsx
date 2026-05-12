// Sidebar.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  IconButton
} from '@mui/material';
import { 
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/system';

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 280,
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  zIndex: 1200,
  [theme.breakpoints.down('md')]: {
    transform: props => props.open ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    boxShadow: props => props.open ? '0 0 15px rgba(0,0,0,0.5)' : 'none',
  }
}));

const LogoSection = styled(Box)({
  padding: '20px',
  textAlign: 'center',
  borderBottom: '1px solid rgba(255,255,255,0.1)'
});

const Logo = styled('img')({
  width: '80%',
  maxWidth: 180,
  margin: '0 auto'
});

const StyledListItem = styled(ListItem)(({ active }) => ({
  cursor: 'pointer',
  backgroundColor: active ? 'rgba(202, 0, 25, 0.15)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(202, 0, 25, 0.1)',
  },
  borderLeft: active ? '4px solid #ca0019' : '4px solid transparent'
}));

const SocialSection = styled(Box)({
  marginTop: 'auto',
  padding: '20px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  textAlign: 'center'
});

const SocialIcon = styled(IconButton)({
  color: 'white',
  margin: '0 8px',
  '&:hover': {
    color: '#ca0019',
  }
});

const Sidebar = ({ students, onDrawerToggle, isDrawerOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  return (
    <SidebarContainer open={isDrawerOpen}>
      <LogoSection>
        <Logo src="/logo-uniques.png" alt="The Uniques Community" />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: '#ca0019' }}>
          Success Stories
        </Typography>
      </LogoSection>

      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
          Explore inspiring journeys of our community members who have achieved remarkable success in their careers.
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      
      <List sx={{ flexGrow: 1, overflowY: 'auto', pb: 2 }}>
        {students.map((student) => (
          <StyledListItem
            key={student.id}
            component={Link}
            to={`/success-stories/${student.id}`}
            active={currentPath === student.id ? 1 : 0}
            onClick={() => onDrawerToggle && onDrawerToggle()}
          >
            <ListItemAvatar>
              <Avatar src={student.image} alt={student.name} />
            </ListItemAvatar>
            <ListItemText
              primary={student.name}
              secondary={
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {student.batch} • {student.role}
                </Typography>
              }
            />
          </StyledListItem>
        ))}
      </List>

      <SocialSection>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
          Connect with The Uniques Community
        </Typography>
        <Box>
          <SocialIcon size="small" aria-label="LinkedIn">
            <LinkedInIcon fontSize="small" />
          </SocialIcon>
          <SocialIcon size="small" aria-label="Twitter">
            <TwitterIcon fontSize="small" />
          </SocialIcon>
          <SocialIcon size="small" aria-label="Instagram">
            <InstagramIcon fontSize="small" />
          </SocialIcon>
          <SocialIcon size="small" aria-label="Facebook">
            <FacebookIcon fontSize="small" />
          </SocialIcon>
        </Box>
      </SocialSection>
    </SidebarContainer>
  );
};

export default Sidebar;
