import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  styled,
  Container,
  useTheme,
  useMediaQuery,
  Fade,
  Fab,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Call,
  ChatBubble,
  Check,
  Close,
  Delete,
  Download,
  Edit,
  Email,
  FilePresent,
  History,
  MoreHoriz,
  Save,
  Task,
  Add
} from '@mui/icons-material';

import {
  summaryData,
  analyticsData,
  detailsData,
  filesData,
  historyData
} from '@/assets/dummyData/adminData';

// Styled Components
const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#f0f0f0',
  borderRadius: '50%',
  padding: 8,
  margin: '0 4px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: '#e0e0e0'
  }
}));

const RoundedChip = styled(Chip)(() => ({
  borderRadius: 16,
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

const AnimatedCard = styled(Card)(({ theme }) => ({
  
  marginBottom: theme.spacing(2),
  width: '100%',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  backgroundColor: '#ffffff',
}));



const ActivityCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'relative',
  transition: 'all 0.3s ease',
  border: '1px solid #e0e0e0',
  
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      style={{
        width: '100%',
        padding: theme.spacing(3),
        animation: 'fadeIn 0.4s ease-in-out',
      }}
    >
      {value === index && (
        <Fade in={true}>
          <div>{children}</div>
        </Fade>
      )}
    </div>
  );
}

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'info',
    icon: '📝',
    name: '',
    size: '0 KB',
    fileType: 'pdf',
    action: '',
    details: '',
    user: 'Jessie Caballero'
  });
  
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Jessie Caballero',
    title: 'Product Manager - Microsoft',
    address: '218 Thorndyke Dr, Syracuse, Connecticut 36524',
    email: 'michelle.rivera@example.com'
  });
  
  const [activities, setActivities] = useState(summaryData.recentActivities);
  const [metrics, setMetrics] = useState(summaryData.keyMetrics);
  const [files, setFiles] = useState(filesData);
  const [history, setHistory] = useState(historyData);

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      body {
        background-color: #f5f7fa;
        margin: 0;
        padding: 0;
      }
      
      .activity-card {
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .activity-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
        transition: all 0.3s ease;
      }
      
      .activity-card:hover::before {
        transform: translateX(100%);
      }

      .wave-card {
        position: relative;
        overflow: hidden;
      }

      .wave-card::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
        transform: rotate(45deg);
        transition: all 0.6s ease-in-out;
        opacity: 0;
      }

      .wave-card:hover::after {
        opacity: 1;
        transform: rotate(45deg) translate(-30%, -30%);
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setEditItemId(null);
  };

  const handleEditSave = () => {
    setEditMode(!editMode);
  };

  const handleAddItem = (type) => {
    setDialogType(type);
    setNewItem({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'info',
      icon: '📝',
      name: '',
      size: '0 KB',
      fileType: 'pdf',
      action: '',
      details: '',
      user: personalInfo.name
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveNewItem = () => {
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    
    switch (dialogType) {
      case 'activity':
        setActivities([...activities, {
          date: currentDate,
          title: newItem.title,
          description: newItem.description,
          type: newItem.type,
          icon: newItem.icon
        }]);
        break;
      case 'file':
        setFiles([...files, {
          name: newItem.name,
          size: newItem.size,
          uploadedOn: currentDate,
          uploadedBy: personalInfo.name,
          type: newItem.fileType,
          status: 'new'
        }]);
        break;
      case 'history':
        setHistory([...history, {
          date: currentDate,
          action: newItem.action,
          user: personalInfo.name,
          details: newItem.details,
          type: newItem.type
        }]);
        break;
    }
    handleCloseDialog();
  };

  const handleDeleteItem = (type, id) => {
    switch (type) {
      case 'activity':
        setActivities(activities.filter((_, index) => index !== id));
        break;
      case 'file':
        setFiles(files.filter((_, index) => index !== id));
        break;
      case 'history':
        setHistory(history.filter((_, index) => index !== id));
        break;
    }
  };

  const handleEditItem = (id) => {
    setEditItemId(id === editItemId ? null : id);
  };

  const handleSaveEdit = (type, id) => {
    setEditItemId(null);
  };

  const renderRightPanel = () => (
    <Grid item xs={12} md={4} sx={{pr: 2}}>
      <AnimatedCard className='border border-slate-300' sx={{ mb: 3, borderRadius:1, boxShadow:0 }}>
        <CardContent >
          <Typography variant="h6" gutterBottom>Quick Stats</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography color="text.secondary">Deal Value</Typography>
            <Typography fontWeight="bold" color="primary">$250,000</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography color="text.secondary">Probability</Typography>
            <Typography fontWeight="bold" color="success.main">75%</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Stage</Typography>
            <Chip label="Negotiation" color="primary" size="small" />
          </Box>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard className='border border-slate-300' sx={{borderRadius:1, boxShadow:0}}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recent Contacts</Typography>
          {detailsData.contacts.map((contact, index) => (
            <Box key={index} sx={{ mb: index < detailsData.contacts.length - 1 ? 2 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>{contact.name[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle2">{contact.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{contact.role}</Typography>
                </Box>
              </Box>
              <Divider />
            </Box>
          ))}
        </CardContent>
      </AnimatedCard>
    </Grid>
  );

  const renderAddDialog = () => (
    <Dialog 
      open={openDialog} 
      onClose={handleCloseDialog} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          p: 1
        }
      }}
    >
      <DialogTitle>
        Add New {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
      </DialogTitle>
      <DialogContent>
        {dialogType === 'activity' && (
          <>
            <TextField
              fullWidth
              label="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Icon</InputLabel>
              <Select
                value={newItem.icon}
                onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                label="Icon"
              >
                <MenuItem value="📝">📝 Document</MenuItem>
                <MenuItem value="📅">📅 Calendar</MenuItem>
                <MenuItem value="💰">💰 Money</MenuItem>
                <MenuItem value="📊">📊 Chart</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        {dialogType === 'file' && (
          <>
            <TextField
              fullWidth
              label="File Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>File Type</InputLabel>
              <Select
                value={newItem.fileType}
                onChange={(e) => setNewItem({ ...newItem, fileType: e.target.value })}
                label="File Type"
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="word">Word</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        {dialogType === 'history' && (
          <>
            <TextField
              fullWidth
              label="Action"
              value={newItem.action}
              onChange={(e) => setNewItem({ ...newItem, action: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Details"
              value={newItem.details}
              onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSaveNewItem} 
          variant="contained" 
          color="primary"
          sx={{ borderRadius: 2 }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
      {/* Profile Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Avatar
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                alt={personalInfo.name}
                sx={{ 
                  width: { xs: 80, md: 100 }, 
                  height: { xs: 80, md: 100 }, 
                  mr: 3,
                  mb: { xs: 2, md: 0 }
                }}
              />
              <Box sx={{ flex: 1, minWidth: 250 }}>
                {editMode ? (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Title"
                      value={personalInfo.title}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h4" sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                      {personalInfo.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                      {personalInfo.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {personalInfo.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {personalInfo.email}
                    </Typography>
                  </>
                )}

                <Box sx={{ display: 'flex', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                  <ActionButton sx={{ bgcolor: '#e8f5e9' }}>
                    <Call fontSize="small" sx={{ color: '#4caf50' }} />
                  </ActionButton>
                  <ActionButton sx={{ bgcolor: '#fff8e1' }}>
                    <Email fontSize="small" sx={{ color: '#ffc107' }} />
                  </ActionButton>
                  <ActionButton sx={{ bgcolor: '#e3f2fd' }}>
                    <ChatBubble fontSize="small" sx={{ color: '#2196f3' }} />
                  </ActionButton>
                  <ActionButton sx={{ bgcolor: '#f3e5f5' }}>
                    <Task fontSize="small" sx={{ color: '#9c27b0' }} />
                  </ActionButton>
                  <ActionButton 
                    onClick={handleEditSave} 
                    sx={{ bgcolor: editMode ? '#e8f5e9' : '#fffde7' }}
                  >
                    {editMode ? 
                      <Save fontSize="small" sx={{ color: '#4caf50' }} /> : 
                      <Edit fontSize="small" sx={{ color: '#ffeb3b' }} />
                    }
                  </ActionButton>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          sx={{
            '& .MuiTabs-flexContainer': {
              gap: 2
            }
          }}
        >
          <Tab label="Summary" />
          <Tab label="Analytics" />
          <Tab label="Details" />
          <Tab label="Files" />
          <Tab label="History" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Paper sx={{ bgcolor: 'white' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Recent Activities</Typography>
                {activities.map((activity, index) => (
                  <ActivityCard sx={{borderRadius:1}} key={index}>
                    {editItemId === `activity-${index} `? (
                      <Box sx={{ mb: 2}}>
                        <TextField
                          fullWidth
                          label="Title"
                          value={activity.title}
                          onChange={(e) => {
                            const newActivities = [...activities];
                            newActivities[index] = { ...activity, title: e.target.value };
                            setActivities(newActivities);
                          }}
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          fullWidth
                          label="Description"
                          value={activity.description}
                          onChange={(e) => {
                            const newActivities = [...activities];
                            newActivities[index] = { ...activity, description: e.target.value };
                            setActivities(newActivities);
                          }}
                          multiline
                          rows={2}
                          sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => setEditItemId(null)}
                            startIcon={<Close />}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleSaveEdit('activity', index)}
                            startIcon={<Check />}
                          >
                            Save
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h3" sx={{ mr: 2, fontSize: '24px' }}>{activity.icon}</Typography>
                          <Typography variant="subtitle1" fontWeight="medium">{activity.title}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{activity.description}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">{activity.date}</Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => `handleEditItem(activity-${index})`}
                              sx={{ mr: 1 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItem('activity', index)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </>
                    )}
                  </ActivityCard>
                ))}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Engagement Metrics</Typography>
                {Object.entries(analyticsData.engagementMetrics).map(([key, value], index) => (
                  <ActivityCard sx={{borderRadius:1}} key={key}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">{key.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">{value}</Typography>
                    </Box>
                  </ActivityCard>
                ))}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Company Information</Typography>
                <Grid container spacing={2}>
                  {Object.entries(detailsData.company).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <ActivityCard sx={{borderRadius:1}}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="medium">{value}</Typography>
                      </ActivityCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Documents</Typography>
                {files.map((file, index) => (
                  <ActivityCard sx={{borderRadius:1}} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <FilePresent 
                          sx={{ 
                            mr: 2, 
                            color: file.type === 'pdf' ? '#f44336' : 
                                   file.type === 'word' ? '#2196f3' : '#4caf50' 
                          }} 
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">{file.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {file.size} • Uploaded on {file.uploadedOn} by {file.uploadedBy}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <Download />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteItem('file', index)}> <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </ActivityCard>
                ))}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Activity History</Typography>
                {history.map((item, index) => (
                  <ActivityCard sx={{borderRadius:1}} key={index}>
                    {editItemId === `history-${index}` ? (
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          label="Action"
                          value={item.action}
                          onChange={(e) => {
                            const newHistory = [...history];
                            newHistory[index] = { ...item, action: e.target.value };
                            setHistory(newHistory);
                          }}
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          fullWidth
                          label="Details"
                          value={item.details}
                          onChange={(e) => {
                            const newHistory = [...history];
                            newHistory[index] = { ...item, details: e.target.value };
                            setHistory(newHistory);
                          }}
                          multiline
                          rows={2}
                          sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => setEditItemId(null)}
                            startIcon={<Close />}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleSaveEdit('history', index)}
                            startIcon={<Check />}
                          >
                            Save
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Typography variant="subtitle1" fontWeight="medium">{item.action}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{item.details}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {item.date} • {item.user}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditItem(`history-${index}`)}
                              sx={{ mr: 1 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItem('history', index)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </>
                    )}
                  </ActivityCard>
                ))}
              </Box>
            </TabPanel>
          </Grid>
          {renderRightPanel()}
        </Grid>
      </Paper>

      {/* Floating Action Button for adding new items */}
      <FloatingActionButton
        color="primary"
        onClick={() => handleAddItem(tabValue === 0 ? 'activity' : tabValue === 3 ? 'file' : 'history')}
        sx={{
          display: [0, 3, 4].includes(tabValue) ? 'flex' : 'none'
        }}
      >
        <Add />
      </FloatingActionButton>

      {renderAddDialog()}
    </Container>
  );
}

export default App;
