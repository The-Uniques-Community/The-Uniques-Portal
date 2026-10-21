/**
 * @file index.jsx
 * @description Coordinator Profile View connected to Redux store and real backend endpoints.
 * Displays profile details, Google Drive proxied avatar, action triggers, live system stats,
 * coordinator metadata, Uniques 360 tasks, projects, internships, achievements, and an edit profile modal.
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';

// Icons
import Call from '@mui/icons-material/Call';
import Email from '@mui/icons-material/Email';
import WhatsApp from '@mui/icons-material/WhatsApp';
import LinkedIn from '@mui/icons-material/LinkedIn';
import GitHub from '@mui/icons-material/GitHub';
import Instagram from '@mui/icons-material/Instagram';
import Twitter from '@mui/icons-material/Twitter';
import Edit from '@mui/icons-material/Edit';
import LocationOn from '@mui/icons-material/LocationOn';
import School from '@mui/icons-material/School';
import Badge from '@mui/icons-material/Badge';
import Assignment from '@mui/icons-material/Assignment';
import Work from '@mui/icons-material/Work';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import CheckCircle from '@mui/icons-material/CheckCircle';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Launch from '@mui/icons-material/Launch';
import Groups from '@mui/icons-material/Groups';
import Event from '@mui/icons-material/Event';
import TaskAlt from '@mui/icons-material/TaskAlt';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Person from '@mui/icons-material/Person';
import Code from '@mui/icons-material/Code';
import Close from '@mui/icons-material/Close';

// Redux Thunks
import {
  fetchUserProfile,
  fetchCoordinatorTasks,
  fetchCoordinatorStats,
  updateUserProfile,
} from '@/redux/slices/userSlice';

import { BASE_URL } from '@/config';
import { toast } from 'react-toastify';

const BRAND_COLOR = '#ca0019';
const BRAND_HOVER = '#a30014';

/**
 * Safely format date strings
 */
const formatDate = (dateStr, formatPattern = 'MMM dd, yyyy') => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'N/A' : format(d, formatPattern);
  } catch {
    return 'N/A';
  }
};

/**
 * Derive avatar source with Google Drive proxy fallback
 */
const getAvatarUrl = (profile) => {
  if (profile?.profilePic?.fileId) {
    return `${BASE_URL}/api/image-proxy/${profile.profilePic.fileId}`;
  }
  if (typeof profile?.profilePic === 'string' && profile.profilePic.startsWith('http')) {
    return profile.profilePic;
  }
  return profile?.avatarUrl || profile?.profilePic?.url || null;
};

/**
 * Color mapping for task & profile status
 */
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'active':
    case 'approved':
      return 'success';
    case 'in-progress':
    case 'pending':
      return 'warning';
    case 'blocked':
    case 'inactive':
    case 'suspended':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Priority color helper
 */
const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Tab panel wrapper
 */
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`coordinator-tabpanel-${index}`}
      aria-labelledby={`coordinator-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CoordinatorProfile() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  const { profile, currentUser, tasks, stats, isLoading, isUpdating } = useSelector(
    (state) => state.user
  );

  const activeProfile = profile || currentUser;

  const [tabValue, setTabValue] = useState(0);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Edit Modal Form State
  const [formData, setFormData] = useState({
    fullName: '',
    designation: '',
    contact: '',
    whatsappContact: '',
    address: '',
    city: '',
    state: '',
    bio: '',
    skills: '',
    linkedinProfile: '',
    githubProfile: '',
    instagramProfile: '',
    twitterProfile: '',
  });

  // Fetch initial profile & dashboard data
  useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile());
    }
    dispatch(fetchCoordinatorTasks());
    dispatch(fetchCoordinatorStats());
  }, [dispatch, profile]);

  // Sync profile data to modal form when opened
  const handleOpenEditModal = () => {
    setFormData({
      fullName: activeProfile?.fullName || activeProfile?.name || '',
      designation: activeProfile?.designation || '',
      contact: activeProfile?.contact || '',
      whatsappContact: activeProfile?.whatsappContact || '',
      address: activeProfile?.address || '',
      city: activeProfile?.city || '',
      state: activeProfile?.state || '',
      bio: activeProfile?.bio || '',
      skills: Array.isArray(activeProfile?.skills)
        ? activeProfile.skills.join(', ')
        : (activeProfile?.skills || ''),
      linkedinProfile: activeProfile?.linkedinProfile || '',
      githubProfile: activeProfile?.githubProfile || '',
      instagramProfile: activeProfile?.instagramProfile || '',
      twitterProfile: activeProfile?.twitterProfile || '',
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    if (!isUpdating) {
      setOpenEditModal(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    const id = activeProfile?._id || activeProfile?.id;
    if (!id) {
      toast.error('Unable to locate profile identifier');
      return;
    }

    const formattedSkills = formData.skills
      ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const updateData = {
      ...formData,
      skills: formattedSkills,
    };

    try {
      await dispatch(updateUserProfile({ id, updateData })).unwrap();
      toast.success('Profile updated successfully');
      setOpenEditModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to update profile');
    }
  };

  // Derive display values
  const avatarUrl = getAvatarUrl(activeProfile);
  const initials = activeProfile?.fullName
    ? activeProfile.fullName.charAt(0).toUpperCase()
    : 'C';
  const roleDisplay = activeProfile?.role
    ? activeProfile.role.toUpperCase()
    : 'COORDINATOR';
  const locationDisplay = [activeProfile?.city, activeProfile?.state].filter(Boolean).join(', ') ||
    activeProfile?.address ||
    'Location Not Specified';
  const whatsappNum = activeProfile?.whatsappContact || activeProfile?.contact;

  // Stats derivations
  const communityMembersCount = stats?.memberCounts?.all ?? stats?.memberCounts?.total ?? 0;
  const eventsCount = stats?.eventCounts?.totalCount ?? stats?.eventCounts?.total ?? 0;
  const tasksCount = tasks?.length || 0;
  const completedTasksCount = tasks?.filter((t) => t.status?.toLowerCase() === 'completed')?.length || 0;

  if (isLoading && !activeProfile) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Skeleton variant="circular" width={100} height={100} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="25%" height={25} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          </Box>
        </Paper>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, minHeight: '100vh' }}>
      {/* =========================================================================
          PROFILE HEADER CARD
      ========================================================================= */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 4,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            textAlign: { xs: 'center', md: 'left' },
            gap: 3,
          }}
        >
          {/* Avatar with fallback initials */}
          <Avatar
            src={avatarUrl || undefined}
            alt={activeProfile?.fullName || 'Coordinator'}
            sx={{
              width: { xs: 90, md: 120 },
              height: { xs: 90, md: 120 },
              border: `3px solid ${BRAND_COLOR}`,
              bgcolor: alpha(BRAND_COLOR, 0.15),
              color: BRAND_COLOR,
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 800,
              boxShadow: `0 8px 24px -4px ${alpha(BRAND_COLOR, 0.35)}`,
            }}
          >
            {!avatarUrl && initials}
          </Avatar>

          {/* User Meta Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                gap: 1.5,
                mb: 0.5,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.6rem', md: '2.1rem' },
                }}
              >
                {activeProfile?.fullName || activeProfile?.name || 'Coordinator'}
              </Typography>
              <Chip
                label={roleDisplay}
                size="small"
                sx={{
                  bgcolor: alpha(BRAND_COLOR, 0.12),
                  color: BRAND_COLOR,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${alpha(BRAND_COLOR, 0.3)}`,
                }}
              />
            </Box>

            <Typography
              variant="subtitle1"
              sx={{ color: 'text.secondary', fontWeight: 600, mb: 1.5 }}
            >
              {activeProfile?.designation || 'Operational Coordinator'}
            </Typography>

            {/* Academic & Location details */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                gap: { xs: 1.5, md: 3 },
                color: 'text.secondary',
                fontSize: '0.875rem',
                mb: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <School sx={{ fontSize: 18, color: BRAND_COLOR }} />
                <span>{activeProfile?.course || 'B.Tech CSE'}</span>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarMonth sx={{ fontSize: 18, color: BRAND_COLOR }} />
                <span>{activeProfile?.batch || 'The Uniques'}</span>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Badge sx={{ fontSize: 18, color: BRAND_COLOR }} />
                <span>Adm No: {activeProfile?.admno || activeProfile?.admnNo || 'N/A'}</span>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <LocationOn sx={{ fontSize: 18, color: BRAND_COLOR }} />
                <span>{locationDisplay}</span>
              </Box>
            </Box>

            {/* Action Buttons: Phone, Email, WhatsApp, Socials, Edit Profile */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                gap: 1.2,
              }}
            >
              {/* Phone */}
              <Tooltip title={activeProfile?.contact ? `Call: ${activeProfile.contact}` : 'No phone number available'}>
                <span>
                  <IconButton
                    component="a"
                    href={activeProfile?.contact ? `tel:${activeProfile.contact}` : undefined}
                    disabled={!activeProfile?.contact}
                    sx={{
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f0f4f8',
                      color: '#4caf50',
                      '&:hover': { bgcolor: alpha('#4caf50', 0.15), transform: 'scale(1.08)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Call fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Email */}
              <Tooltip title={activeProfile?.email ? `Email: ${activeProfile.email}` : 'No email available'}>
                <span>
                  <IconButton
                    component="a"
                    href={activeProfile?.email ? `mailto:${activeProfile.email}` : undefined}
                    disabled={!activeProfile?.email}
                    sx={{
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f0f4f8',
                      color: '#ff9800',
                      '&:hover': { bgcolor: alpha('#ff9800', 0.15), transform: 'scale(1.08)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Email fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              {/* WhatsApp */}
              <Tooltip title={whatsappNum ? `WhatsApp: ${whatsappNum}` : 'No WhatsApp available'}>
                <span>
                  <IconButton
                    component="a"
                    href={
                      whatsappNum
                        ? `https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={!whatsappNum}
                    sx={{
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f0f4f8',
                      color: '#25D366',
                      '&:hover': { bgcolor: alpha('#25D366', 0.15), transform: 'scale(1.08)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <WhatsApp fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              {/* LinkedIn */}
              <Tooltip title={activeProfile?.linkedinProfile ? 'LinkedIn Profile' : 'No LinkedIn profile linked'}>
                <span>
                  <IconButton
                    component="a"
                    href={activeProfile?.linkedinProfile || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={!activeProfile?.linkedinProfile}
                    sx={{
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f0f4f8',
                      color: '#0077b5',
                      '&:hover': { bgcolor: alpha('#0077b5', 0.15), transform: 'scale(1.08)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <LinkedIn fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              {/* GitHub */}
              <Tooltip title={activeProfile?.githubProfile ? 'GitHub Profile' : 'No GitHub profile linked'}>
                <span>
                  <IconButton
                    component="a"
                    href={activeProfile?.githubProfile || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={!activeProfile?.githubProfile}
                    sx={{
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f0f4f8',
                      color: isDarkMode ? '#ffffff' : '#24292e',
                      '&:hover': { bgcolor: alpha(BRAND_COLOR, 0.1), transform: 'scale(1.08)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <GitHub fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Edit Profile Button */}
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleOpenEditModal}
                sx={{
                  ml: { xs: 0, sm: 1 },
                  bgcolor: BRAND_COLOR,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 2.5,
                  height: 40,
                  boxShadow: `0 4px 14px 0 ${alpha(BRAND_COLOR, 0.39)}`,
                  '&:hover': {
                    bgcolor: BRAND_HOVER,
                  },
                }}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* =========================================================================
          MAIN LAYOUT: CONTENT TABS (LEFT) & METADATA / STATS (RIGHT)
      ========================================================================= */}
      <Grid container spacing={3}>
        {/* Left Column: Navigation Tabs & TabPanels */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, val) => setTabValue(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  minHeight: 48,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: BRAND_COLOR,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: BRAND_COLOR,
                  height: 3,
                  borderRadius: '3px',
                },
              }}
            >
              <Tab label="Overview & Bio" />
              <Tab label={`Uniques 360 Tasks (${tasksCount})`} />
              <Tab label="Projects & Internships" />
              <Tab label="Achievements" />
            </Tabs>

            {/* -------------------------------------------------------------
                TAB 0: Overview & Bio
            ------------------------------------------------------------- */}
            <CustomTabPanel value={tabValue} index={0}>
              {/* Biography Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
                  Biography
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fbfbfb',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {activeProfile?.bio ||
                      'No biography provided yet. Click "Edit Profile" above to share your background and coordinator focus.'}
                  </Typography>
                </Paper>
              </Box>

              {/* Academic Highlights */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
                  Academic Credentials
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fbfbfb',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Degree & Major
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {activeProfile?.course || 'B.Tech CSE'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fbfbfb',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Batch Cohort
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {activeProfile?.batch || 'The Uniques 5.0'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fbfbfb',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Admission Roll Number
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {activeProfile?.admno || activeProfile?.admnNo || 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fbfbfb',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Cumulative Grade Point Average (CGPA)
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BRAND_COLOR }}>
                        {activeProfile?.cgpa || '8.50'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Technical Skills */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
                  Competencies & Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Array.isArray(activeProfile?.skills) && activeProfile.skills.length > 0 ? (
                    activeProfile.skills.map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill}
                        sx={{
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f0f4f8',
                          color: 'text.primary',
                          fontWeight: 600,
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: 'divider',
                          px: 0.5,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No skills added yet. Use Edit Profile to list technical stacks.
                    </Typography>
                  )}
                </Box>
              </Box>
            </CustomTabPanel>

            {/* -------------------------------------------------------------
                TAB 1: Uniques 360 Tasks
            ------------------------------------------------------------- */}
            <CustomTabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Managed Operational Tasks
                </Typography>
                <Chip
                  label={`${tasksCount} Total`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, borderRadius: '6px' }}
                />
              </Box>

              {tasksCount === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: '12px',
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
                  }}
                >
                  <TaskAlt sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    No Tasks Assigned Yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Tasks assigned through the Uniques 360 workspace will appear here with live progress tracking.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {tasks.map((task) => (
                    <Card
                      key={task._id || task.id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: isDarkMode
                            ? '0 6px 20px rgba(0, 0, 0, 0.3)'
                            : '0 6px 20px rgba(0, 0, 0, 0.06)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {task.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={task.priority?.toUpperCase() || 'MEDIUM'}
                            size="small"
                            color={getPriorityColor(task.priority)}
                            sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '4px' }}
                          />
                          <Chip
                            label={task.status?.replace('-', ' ').toUpperCase() || 'PENDING'}
                            size="small"
                            color={getStatusColor(task.status)}
                            sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '4px' }}
                          />
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                        {task.description || 'No detailed instructions provided.'}
                      </Typography>

                      <Divider sx={{ mb: 1.5 }} />

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'text.secondary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <CalendarMonth sx={{ fontSize: 16, color: BRAND_COLOR }} />
                          <span>Deadline: {formatDate(task.deadline)}</span>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Groups sx={{ fontSize: 16, color: BRAND_COLOR }} />
                          <span>
                            {Array.isArray(task.assignedTo) ? task.assignedTo.length : 0} Members Assigned
                          </span>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </CustomTabPanel>

            {/* -------------------------------------------------------------
                TAB 2: Projects & Internships
            ------------------------------------------------------------- */}
            <CustomTabPanel value={tabValue} index={2}>
              {/* Projects */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                  Projects
                </Typography>
                {!activeProfile?.projects || activeProfile.projects.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: '12px',
                      border: '1px dashed',
                      borderColor: 'divider',
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
                    }}
                  >
                    <Code sx={{ fontSize: 36, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      No project portfolio items added to user document.
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    {activeProfile.projects.map((project, idx) => (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2.5,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                          }}
                        >
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {project.title}
                              </Typography>
                              {project.link && (
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ color: BRAND_COLOR }}
                                >
                                  <Launch fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                              {project.description}
                            </Typography>
                          </Box>

                          {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                              {project.technologies.map((tech, tIdx) => (
                                <Chip
                                  key={tIdx}
                                  label={tech}
                                  size="small"
                                  sx={{ fontSize: '0.7rem', borderRadius: '4px' }}
                                />
                              ))}
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>

              {/* Internships */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                  Professional Internships
                </Typography>
                {!activeProfile?.internships || activeProfile.internships.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: '12px',
                      border: '1px dashed',
                      borderColor: 'divider',
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
                    }}
                  >
                    <Work sx={{ fontSize: 36, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      No internship history recorded.
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {activeProfile.internships.map((internship, idx) => (
                      <Card
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: '12px',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {internship.role || internship.title || 'Intern'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: BRAND_COLOR, fontWeight: 700 }}>
                            {internship.duration || internship.period || 'Completed'}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                          {internship.company || internship.organization}
                        </Typography>
                        {internship.description && (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {internship.description}
                          </Typography>
                        )}
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </CustomTabPanel>

            {/* -------------------------------------------------------------
                TAB 3: Achievements
            ------------------------------------------------------------- */}
            <CustomTabPanel value={tabValue} index={3}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                Honors & Accomplishments
              </Typography>
              {!activeProfile?.achievements || activeProfile.achievements.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: '12px',
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    No Achievements Listed
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Academic and leadership recognitions will be presented here.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activeProfile.achievements.map((item, idx) => (
                    <Card
                      key={idx}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <EmojiEvents sx={{ color: '#ffb300' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {typeof item === 'string' ? item : item.title || item.name}
                        </Typography>
                      </Box>
                      {item.description && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 4.5 }}>
                          {item.description}
                        </Typography>
                      )}
                      {item.date && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 4.5, display: 'block', mt: 0.5 }}>
                          Awarded on {formatDate(item.date)}
                        </Typography>
                      )}
                    </Card>
                  ))}
                </Box>
              )}
            </CustomTabPanel>
          </Paper>
        </Grid>

        {/* =====================================================================
            RIGHT COLUMN: REAL STATS & METADATA CARDS
        ===================================================================== */}
        <Grid item xs={12} md={4}>
          {/* Quick Real Stats Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, color: 'text.primary' }}>
              Operational Metrics
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Groups sx={{ color: BRAND_COLOR }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Community Members
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {communityMembersCount}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Event sx={{ color: '#2196f3' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Active Events
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {eventsCount}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Assignment sx={{ color: '#ff9800' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Managed Tasks
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {tasksCount}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <TaskAlt sx={{ color: '#4caf50' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Completed Tasks
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {completedTasksCount}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Coordinator System Metadata Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, color: 'text.primary' }}>
              Coordinator Status
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Account Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Account Status
                </Typography>
                <Chip
                  label={(activeProfile?.status || activeProfile?.profileStatus || 'active').toUpperCase()}
                  size="small"
                  color={getStatusColor(activeProfile?.status || activeProfile?.profileStatus || 'active')}
                  sx={{ fontWeight: 700, borderRadius: '6px' }}
                />
              </Box>

              {/* Portal Role */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Assigned Role
                </Typography>
                <Chip
                  label={roleDisplay}
                  size="small"
                  sx={{
                    bgcolor: alpha(BRAND_COLOR, 0.1),
                    color: BRAND_COLOR,
                    fontWeight: 700,
                    borderRadius: '6px',
                  }}
                />
              </Box>

              {/* Verification */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Verification
                </Typography>
                <Chip
                  icon={activeProfile?.isVerified ? <CheckCircle /> : <HelpOutline />}
                  label={activeProfile?.isVerified ? 'Verified' : 'Unverified'}
                  size="small"
                  color={activeProfile?.isVerified ? 'success' : 'default'}
                  sx={{ fontWeight: 700, borderRadius: '6px' }}
                />
              </Box>

              {/* Joined Date */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Member Since
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {formatDate(activeProfile?.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* =========================================================================
          EDIT PROFILE MODAL DIALOG
      ========================================================================= */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: 'background.paper',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Edit Coordinator Profile
          </Typography>
          <IconButton onClick={handleCloseEditModal} disabled={isUpdating} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSaveProfile}>
          <DialogContent dividers sx={{ borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation / Title"
                  name="designation"
                  value={formData.designation}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  name="contact"
                  value={formData.contact}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="WhatsApp Number"
                  name="whatsappContact"
                  value={formData.whatsappContact}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Biography"
                  name="bio"
                  value={formData.bio}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                  helperText="Summarize your professional background and coordinator goals"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Skills (comma separated)"
                  name="skills"
                  value={formData.skills}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                  placeholder="React, Node.js, Project Management, Python"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn Profile URL"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                  placeholder="https://linkedin.com/in/username"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GitHub Profile URL"
                  name="githubProfile"
                  value={formData.githubProfile}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                  placeholder="https://github.com/username"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Instagram Profile URL"
                  name="instagramProfile"
                  value={formData.instagramProfile}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                  placeholder="https://instagram.com/username"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Twitter / X Profile URL"
                  name="twitterProfile"
                  value={formData.twitterProfile}
                  onChange={handleFormChange}
                  disabled={isUpdating}
                  placeholder="https://twitter.com/username"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseEditModal} disabled={isUpdating} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isUpdating}
              sx={{
                bgcolor: BRAND_COLOR,
                fontWeight: 700,
                borderRadius: '8px',
                px: 3,
                '&:hover': { bgcolor: BRAND_HOVER },
              }}
            >
              {isUpdating ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
