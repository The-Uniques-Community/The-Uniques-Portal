import React, { useState, useEffect } from 'react';
import ModernStatCard from '@/utils/Card/ModernStatCard';
import FineTable from './components/TransactionTable';
import { 
  Box, 
  Paper, 
  Typography,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  useTheme
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import GroupsIcon from '@mui/icons-material/Groups';
import PaidIcon from '@mui/icons-material/Paid';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import axios from 'axios';
import ModernHeader from '@/utils/Header/ModernHeader';

const API_BASE_URL = 'https://theuniquesportal-server.vercel.app/api/admin';

const Accounts = () => {
  const theme = useTheme();
  // State for statistics
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFinesIssued: 0,
    totalAmount: 0,
    totalPendingAmount: 0,
    totalPaidAmount: 0,
    totalWaivedAmount: 0,
    membersWithPendingFines: 0,
    paidMembers: 0
  });
  
  // State for chart data
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Colors for charts - using theme palette
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main
  ];
  
  // Fetch statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch fine statistics using the dedicated endpoint
        const fineStatsRes = await axios.get(`${API_BASE_URL}/fine/fines/statistics`);
        const fineStats = fineStatsRes.data.data || {};
        
        // 2. Get total members count
        const membersRes = await axios.get(`${API_BASE_URL}/member?limit=1`);
        const totalMembers = membersRes.data.count || 0;
        
        // 3. Calculate members with/without pending fines
        const pendingMembers = fineStats.membersWithPendingFines || 0;
        const paidMembers = totalMembers - pendingMembers;
        
        // 4. Fetch batch-wise distribution for chart
        const batches = [
          "The Uniques 1.0",
          "The Uniques 2.0",
          "The Uniques 3.0",
          "The Uniques 4.0",
          "The Uniques 5.0",
          "The Uniques 6.0",
        ];
        const batchData = [];
        
        for (const batch of batches) {
          try {
            // Get members with pending fines for this batch
            const batchRes = await axios.get(`${API_BASE_URL}/fine/fines/pending/members`, {
              params: { batch, limit: 100 }
            });
            
            const batchMembers = batchRes.data.data.members || [];
            const batchTotal = batchMembers.reduce((sum, m) => sum + (m.totalAmount || 0), 0);
            
            batchData.push({
              name: batch,
              fines: batchTotal,
              members: batchMembers.length
            });
          } catch (err) {
            console.error(`Error fetching batch ${batch}:`, err);
          }
        }
        console.log("Batch Data:", batchData);
        
        // Update statessss
        setStats({
          totalMembers,
          totalFinesIssued: fineStats.totalFinesIssued || 0,
          totalAmount: fineStats.totalAmount || 0,
          totalPendingAmount: fineStats.totalPendingAmount || 0,
          totalPaidAmount: fineStats.totalPaidAmount || 0,
          totalWaivedAmount: fineStats.totalWaivedAmount || 0,
          membersWithPendingFines: pendingMembers,
          paidMembers
        });
        
        setChartData(batchData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load statistics. Please try again later.");
        setLoading(false);
        
        // Fallback data
        setChartData([
          { name: 'The Uniques 1.0', fines: 0, members: 0 },
          { name: 'The Uniques 2.0', fines: 0, members: 0 },
          { name: 'The Uniques 3.0', fines: 0, members: 0 },
          { name: 'The Uniques 4.0', fines: 0, members: 0 },
          { name: 'The Uniques 5.0', fines: 0, members: 0 },
          { name: 'The Uniques 6.0', fines: 0, members: 0 },
        ]);
      }
    };
    
    fetchData();
  }, []);
  
  // Prepare data for pie charttt
  const pieData = [
    { name: 'Paid Members', value: stats.paidMembers },
    { name: 'Members with Fine', value: stats.membersWithPendingFines }
  ];

  return (
    <div className="p-2 sm:p-4">
      <ModernHeader
        title="Financial"
        highlight="Management"
        subtitle="Track fines, pending dues, paid members, and batch-wise financial signals."
      />
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Primary Stats Cards Row */}
      <Typography variant="h6" fontWeight="medium" style={{ color: theme.palette.text.secondary }} className="mb-2">
        Overview
      </Typography>
      <div className='grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-6'>
        <ModernStatCard 
          icon={<GroupsIcon fontSize="large" />}
          label='Total Members' 
          value={loading ? <CircularProgress size={24} /> : stats.totalMembers}
          link="/admin/members-overview"
          color="#2196F3"
          gradient="radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.15) 0%, transparent 50%)"
        />
        <ModernStatCard 
          icon={<ReceiptIcon fontSize="large" />}
          label='Total Fines Issued' 
          value={loading ? <CircularProgress size={24} /> : stats.totalFinesIssued}
          color="#9C27B0"
          gradient="radial-gradient(circle at 80% 20%, rgba(156, 39, 176, 0.15) 0%, transparent 50%)"
        />
        <ModernStatCard 
          icon={<CurrencyRupeeIcon fontSize="large" />}
          label='Total Fine Amount' 
          value={loading ? <CircularProgress size={24} /> : `₹${stats.totalAmount}`}
          color="#FF9800"
          gradient="radial-gradient(circle at 80% 20%, rgba(255, 152, 0, 0.15) 0%, transparent 50%)"
        />
        <ModernStatCard 
          icon={<PendingActionsIcon fontSize="large" />}
          label='Pending Amount' 
          value={loading ? <CircularProgress size={24} /> : `₹${stats.totalPendingAmount}`}
          color="#f44336"
          gradient="radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.15) 0%, transparent 50%)"
        />
      </div>
      
      {/* Secondary Stats Cards Row */}
      <Typography variant="h6" fontWeight="medium" style={{ color: theme.palette.text.secondary }} className="mb-2">
        Member Status
      </Typography>
      <div className='grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-6'>
        <ModernStatCard 
          icon={<PaidIcon fontSize="large" />}
          label='Paid Amount' 
          value={loading ? <CircularProgress size={24} /> : `₹${stats.totalPaidAmount}`}
          color="#4CAF50"
          gradient="radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.15) 0%, transparent 50%)"
        />
        <ModernStatCard 
          icon={<ThumbUpIcon fontSize="large" />}
          label='Waived Amount' 
          value={loading ? <CircularProgress size={24} /> : `₹${stats.totalWaivedAmount}`}
          color="#3F51B5"
          gradient="radial-gradient(circle at 80% 20%, rgba(63, 81, 181, 0.15) 0%, transparent 50%)"
        />
        <ModernStatCard 
          icon={<PaidIcon fontSize="large" />}
          label='Members with No Fine' 
          value={loading ? <CircularProgress size={24} /> : stats.paidMembers}
          color="#10B981"
          gradient="radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)"
        />
        <ModernStatCard 
          icon={<WarningAmberIcon fontSize="large" />}
          label='Members with Pending Fine' 
          value={loading ? <CircularProgress size={24} /> : stats.membersWithPendingFines}
          color="#F43F5E"
          gradient="radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.15) 0%, transparent 50%)"
        />
      </div>
      
      {/* Charts Section and the rest of your code remains the same */}
      {/* ... */}
    
      
      {/* Charts Section */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={8}>
          <Paper elevation={2} className="p-4">
            <Typography variant="h6" fontWeight="bold" className="mb-4">
              Fine Distribution by Batch
            </Typography>
            {loading ? (
              <Box className="flex justify-center items-center" height={300}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Total Fine']}
                    labelStyle={{ color: theme.palette.text.primary }}
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper, 
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  />
                  <Bar dataKey="fines" fill="#ca0019" name="Total Fine" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} className="p-4 h-full">
            <Typography variant="h6" fontWeight="bold" className="mb-4">
              Fine Payment Status
            </Typography>
            {loading ? (
              <Box className="flex justify-center items-center" height={300}>
                <CircularProgress />
              </Box>
            ) : (
              <Box className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Members']} />
                  </PieChart>
                </ResponsiveContainer>
                
                <Box className="mt-4">
                  <div className="flex justify-center gap-4">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: theme.palette.primary.main }}
                      ></div>
                      <Typography variant="body2">Members with Fine</Typography>
                    </div>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: theme.palette.info.main }}
                      ></div>
                      <Typography variant="body2">Paid Members</Typography>
                    </div>
                  </div>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Fine Management Table */}
      <FineTable />
    </div>
  );
};

export default Accounts;
