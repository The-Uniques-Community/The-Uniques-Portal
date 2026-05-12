import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  ListItem,
  Button,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import {
  School as SchoolIcon,
  Timeline as TimelineIcon,
  PlayCircleOutline as VideoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import { successStories } from './successStoriesData';
import ProfileInformation from './ProfileInformation';
import SuccessTimeline from './SuccessTimeline';
import VideoMessage from './VideoMessage';
import ChatbotLink from './ChatbotLink';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '50vh',
  display: 'flex',
  alignItems: 'flex-end',
  padding: '0 3rem',
  paddingBottom: '5rem',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80)',
  color: 'white',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    paddingBottom: '7rem',
    height: '45vh',
  }
}));

const ProfileImageContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '-85px',
  left: '8%',
  zIndex: 5,
  [theme.breakpoints.down('md')]: {
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: '-70px',
  }
}));

const ProfileImage = styled('img')(({ theme }) => ({
  width: '170px',
  height: '170px',
  objectFit: 'cover',
  borderRadius: '50%',
  border: '4px solid #ca0019',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  backgroundColor: '#f5f5f5',
  [theme.breakpoints.down('md')]: {
    width: '140px',
    height: '140px',
  }
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  paddingTop: '100px',
  [theme.breakpoints.down('md')]: {
    paddingTop: '85px',
  }
}));

const AchievementListItem = styled(ListItem)({
  paddingLeft: 0,
  paddingRight: 0,
});

const SectionHeading = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: '20px',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '0',
    width: '50px',
    height: '4px',
    backgroundColor: '#ca0019',
  }
}));

const DetailCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[8],
  }
}));

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Styled Tabs
const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: '#ca0019',
    height: 3,
  },
  borderBottom: '1px solid #e0e0e0',
  marginBottom: theme.spacing(1),
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 48,
  marginRight: theme.spacing(4),
  '&.Mui-selected': {
    color: '#ca0019',
  },
}));

// New Timeline Components
const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingTop: '40px',
  paddingBottom: '60px',
  marginTop: '20px',
  marginBottom: '40px',
}));

const TimelineLine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '5px',
  backgroundColor: '#ca0019',
  top: '50px',
  left: 0,
  zIndex: 0,
}));

const TimelinePoint = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '24px',
  height: '24px',
  backgroundColor: '#ca0019',
  borderRadius: '50%',
  top: '40px',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 0 4px #fff',
}));

const TimelineEvent = styled(Paper)(({ theme, position }) => ({
  position: 'absolute',
  width: '280px',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: '#fff',
  boxShadow: theme.shadows[3],
  top: position === 'top' ? '-180px' : '80px',
  transform: 'translateX(-50%)',
  zIndex: 2,
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '20px',
    height: '20px',
    backgroundColor: 'inherit',
    boxShadow: 'inherit',
    transform: 'rotate(45deg)',
    top: position === 'top' ? '100%' : '-10px',
    left: '50%',
    marginLeft: '-10px',
  }
}));

const TimelineYear = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  fontWeight: 'bold',
  fontSize: '24px',
  color: '#000',
  transform: 'translateX(-50%)',
  top: '15px',
}));

const StudentStory = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mainTabValue, setMainTabValue] = useState(0);
  const [detailTabValue, setDetailTabValue] = useState(0);

  // Tab change handlers
  const handleMainTabChange = (event, newValue) => {
    setMainTabValue(newValue);
  };

  const handleDetailTabChange = (event, newValue) => {
    setDetailTabValue(newValue);
  };

  // Find the student with the matching ID
  const student = successStories.find(s => s.id === studentId);

  // If no matching student is found, show a message or redirect
  if (!student) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Student not found</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/success-stories')}
        >
          Back to Success Stories
        </Button>
      </Box>
    );
  }

  const timelineMinWidth = Math.max(900, (student.timeline?.length || 0) * 240);

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box>
      <HeroSection>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={contentVariants}
          style={{
            maxWidth: '800px',
            width: '100%',
            marginLeft: isMobile ? '0' : '190px',
            textAlign: isMobile ? 'center' : 'left'
          }}
        >
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {student.name}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {student.role} at {student.company}
            </Typography>
            <Chip
              label={student.batch}
              size="small"
              sx={{ mt: 1, bgcolor: '#ca0019', color: 'white' }}
            />
          </Box>
        </motion.div>

        <ProfileImageContainer>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 100 }}
          >
            <ProfileImage
              src={student.image}
              alt={student.name}
            />
          </motion.div>
        </ProfileImageContainer>
      </HeroSection>

      <ContentWrapper>
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main tabs for Profile and Timeline */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <StyledTabs
                value={mainTabValue}
                onChange={handleMainTabChange}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
              >
                <StyledTab
                  icon={<SchoolIcon />}
                  iconPosition="start"
                  label="Profile Information"
                />
                <StyledTab
                  icon={<TimelineIcon />}
                  iconPosition="start"
                  label="Success Timeline"
                />
                <StyledTab
                  icon={<VideoIcon />}
                  iconPosition="start"
                  label="Video Message"
                />
              </StyledTabs>
            </Box>

            {/* Profile Information Tab */}
            <TabPanel value={mainTabValue} index={0}>
              <ProfileInformation
                student={student}
                detailTabValue={detailTabValue}
                onDetailTabChange={handleDetailTabChange}
                isMobile={isMobile}
                StyledTabs={StyledTabs}
                StyledTab={StyledTab}
                SectionHeading={SectionHeading}
                DetailCard={DetailCard}
              />
            </TabPanel>

            {/* Success Timeline Tab - Bauhaus Style */}
            <TabPanel value={mainTabValue} index={1}>
              <SuccessTimeline
                student={student}
                timelineMinWidth={timelineMinWidth}
                SectionHeading={SectionHeading}
              />
            </TabPanel>

            {/* Video Message Tab */}
            <TabPanel value={mainTabValue} index={2}>
              <VideoMessage student={student} SectionHeading={SectionHeading} />
            </TabPanel>

          </motion.div>
        </Box>
      </ContentWrapper>

      <ChatbotLink student={student} />
    </Box>
  );
};

export default StudentStory;
