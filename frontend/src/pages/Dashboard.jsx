import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthContext from "../context/AuthContext";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  Tooltip
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  AddCircle,
  Person,
  Assignment,
  Tune,
  Group,
  TrendingUp,
  Edit,
  Visibility,
  Work as WorkIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  AccountTree as AccountTreeIcon,
  Assignment as AssignmentIcon,
  ViewList as ViewListIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon
} from "@mui/icons-material";

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0
  });
  const [employeeStats, setEmployeeStats] = useState({
    total: 0,
    allocated: 0,
    available: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Get gradient styles from theme
  const gradientStyles = {
    primary: theme.palette.gradients?.primary || 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
    success: theme.palette.gradients?.success || 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
    info: theme.palette.gradients?.info || 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)',
    warning: theme.palette.gradients?.warning || 'linear-gradient(45deg, #D97706 30%, #F59E0B 90%)',
    secondary: theme.palette.gradients?.secondary || 'linear-gradient(45deg, #DB2777 30%, #EC4899 90%)',
    dark: theme.palette.gradients?.dark || 'linear-gradient(45deg, #111827 30%, #1F2937 90%)',
  };
  
  // Solid color versions for alpha operations
  const solidColors = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    info: theme.palette.info.main,
    warning: theme.palette.warning.main,
    secondary: theme.palette.secondary.main,
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const projectsResponse = await fetch("http://localhost:8000/api/projects", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        const employeesResponse = await fetch("http://localhost:8000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (projectsResponse.ok && employeesResponse.ok) {
          const projects = await projectsResponse.json();
          const employees = await employeesResponse.json();
          
          const projectStatistics = {
            total: projects.length,
            active: projects.filter(p => p.status === "active").length,
            completed: projects.filter(p => p.status === "completed").length,
            planning: projects.filter(p => p.status === "planning").length
          };
          setProjectStats(projectStatistics);
          
          const sortedProjects = [...projects].sort((a, b) => 
            new Date(b.start_date) - new Date(a.start_date)
          ).slice(0, 5);
          setRecentProjects(sortedProjects);
          
          const allocatedEmployeeIds = new Set();
          projects.forEach(project => {
            if (project.resource_allocations) {
              project.resource_allocations.forEach(allocation => {
                if (allocation.status !== "completed") {
                  allocatedEmployeeIds.add(allocation.employee_id);
                }
              });
            }
          });
          
          const employeeStatistics = {
            total: employees.length,
            allocated: allocatedEmployeeIds.size,
            available: employees.length - allocatedEmployeeIds.size
          };
          setEmployeeStats(employeeStatistics);
          
          const recentEmps = [...employees].slice(0, 5);
          setRecentEmployees(recentEmps);
        } else {
          throw new Error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };    
    fetchDashboardData();
    
    // Removed auto-refresh functionality
    return () => {};
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 500, opacity: 0.9 }}>
            Loading your dashboard...
          </Typography>
        </motion.div>
      </Box>
    );
  }
  if (error) {
    return (
      <Box m={3}>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert
            severity="error"
            variant="filled"
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            {error}
          </Alert>
        </motion.div>
      </Box>
    );
  }
  // Helper functions removed as we're using gradient styles directly
  return (
    <Box>      {/* Welcome Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: theme.shadows[4],
            backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.6))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle at 30% 107%, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
              pointerEvents: 'none',
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  background: gradientStyles.primary,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  boxShadow: theme.shadows[3],
                  borderWidth: 3,
                  mr: 2
                }}
              >
                {user?.full_name?.[0] || user?.username?.[0] || "A"}
              </Avatar>
              
              <Box>
                <Typography 
                  variant="h3" 
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    mb: 0.5,
                    background: 'linear-gradient(90deg, #F9FAFB 30%, rgba(255, 255, 255, 0.8) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0px 2px 5px rgba(0,0,0,0.2)',
                  }}
                >
                  Welcome, {user?.full_name || user?.username || "Admin"}!
                </Typography>                  <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                >
                  {user?.role === 'project_manager' ? 'Project Manager' : (user?.role === 'admin' ? 'Administrator' : 'Employee')} {user?.department ? `| ${user.department} Department` : ""}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>      {/* Stats Cards */}
      <Grid container spacing={3} justifyContent="center" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundImage: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0) 50%)',
                pointerEvents: 'none',
              }
            }}
          >            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Box
                component={WorkIcon}
                sx={{
                  fontSize: 40,
                  mb: 1,
                  p: 1,
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: theme.palette.primary.light
                }}
              />
              <Typography variant="h5" component="div" gutterBottom fontWeight={700}>
                Total Projects
              </Typography>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
              >
                <Typography
                  variant="h2"
                  component="div"
                  sx={{
                    fontWeight: 800,
                    background: gradientStyles.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.025em',
                    my: 1
                  }}
                >
                  {projectStats.total}
                </Typography>
              </motion.div>
              <Typography variant="body2" color="text.secondary">
                {projectStats.active} active, {projectStats.planning} planned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundImage: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0) 50%)',
                pointerEvents: 'none',
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Box
                component={AssignmentIcon}
                sx={{
                  fontSize: 40,
                  mb: 1,
                  p: 1,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: theme.palette.success.light
                }}
              />              <Typography variant="h5" component="div" gutterBottom fontWeight={700}>
                Active Projects
              </Typography>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.4 }}
              >
                <Typography
                  variant="h2"
                  component="div"
                  sx={{
                    fontWeight: 800,
                    background: gradientStyles.success,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.025em',
                    my: 1
                  }}
                >
                  {projectStats.active}
                </Typography>
              </motion.div>
              <Typography variant="body2" color="text.secondary">
                {projectStats.completed} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundImage: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0) 50%)',
                pointerEvents: 'none',
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>              <Box
                component={AssessmentIcon}
                sx={{
                  fontSize: 40,
                  mb: 1,
                  p: 1,
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: theme.palette.info.light
                }}
              />
              <Typography variant="h5" component="div" gutterBottom fontWeight={700}>
                Total Employees
              </Typography>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.5 }}
              >
                <Typography
                  variant="h2"
                  component="div"
                  sx={{
                    fontWeight: 800,
                    background: gradientStyles.info,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.025em',
                    my: 1
                  }}
                >
                  {employeeStats.total}
                </Typography>
              </motion.div>
              <Typography variant="body2" color="text.secondary">
                {employeeStats.allocated} allocated, {employeeStats.available} available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Project Statistics */}
      <Grid container spacing={3} sx={{ mt: 2 }} justifyContent="center" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">        <Grid item xs={12} md={12} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
            }}
          >            <CardHeader 
              title={
                <Box display="flex" alignItems="center">
                  <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Resource Utilization
                  </Typography>
                </Box>
              }
              sx={{ 
                borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
                background: alpha(theme.palette.primary.main, 0.05),
                '& .MuiCardHeader-action': {
                  margin: 0,
                  alignSelf: 'center',
                }
              }}
            />            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Employee Allocation
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={employeeStats.total ? (employeeStats.allocated / employeeStats.total * 100) : 0}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.secondary.main,
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                      {`${employeeStats.allocated} / ${employeeStats.total}`}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.secondary.main, mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">Allocated: {employeeStats.allocated}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.success.main, mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">Available: {employeeStats.available}</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Project Status
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main, mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">Active: {projectStats.active}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.warning.main, mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">Planning: {projectStats.planning}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9CA3AF', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">Completed: {projectStats.completed}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Active vs Total Projects
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={projectStats.total ? (projectStats.active / projectStats.total * 100) : 0}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: theme.palette.primary.main,
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={500} color="text.secondary">
                        {`${projectStats.active} / ${projectStats.total}`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tables */}
      <Grid container spacing={3} sx={{ mt: 2 }} justifyContent="center" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">        {/* Recent Projects Table */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
            }}
          >            <CardHeader 
              title={
                <Box display="flex" alignItems="center">
                  <AccountTreeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Recent Projects
                  </Typography>
                </Box>
              }
              sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
                background: alpha(theme.palette.primary.main, 0.05),
                '& .MuiCardHeader-action': {
                  margin: 0,
                  alignSelf: 'center',
                }
              }}
              action={                <Button
                  component={Link}
                  to="/view-projects"
                  endIcon={<ArrowForwardIcon />}
                  color="primary"
                  variant="text"
                  sx={{ fontWeight: 500 }}
                >
                  View All
                </Button>
              }
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer
                sx={{
                  maxHeight: 360,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.primary.main, 0.2),
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: alpha(theme.palette.primary.main, 0.3),
                  },
                  '&::-webkit-scrollbar-track': {
                    background: alpha(theme.palette.background.paper, 0.1),
                    borderRadius: '4px',
                  },
                }}
              >
                <Table sx={{ minWidth: 500 }} aria-label="recent projects table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentProjects.length > 0 ? (
                      recentProjects.map((project, index) => (
                        <TableRow
                          key={project.id}
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            },
                          }}
                          component={motion.tr}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{project.name}</TableCell>
                          <TableCell>                              <Chip
                              size="small"
                              label={project.status}
                              sx={{ 
                                fontWeight: 500, 
                                color: 'white',
                                background: project.status === 'active' ? `linear-gradient(90deg, ${theme.palette.success.dark}, ${theme.palette.success.main})` :
                                          project.status === 'completed' ? 'linear-gradient(90deg, #6B7280, #9CA3AF)' :
                                          `linear-gradient(90deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>                              <IconButton
                                size="small"
                                component={Link}
                                to={`/update-project/${project.id}`}
                                sx={{
                                  color: 'white',                                  bgcolor: theme.palette.primary.main,
                                  '&:hover': {
                                    bgcolor: theme.palette.primary.dark,
                                  }
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                component={Link}
                                to={`/employee-matching/${project.id}`}
                                sx={{
                                  color: 'white',                                  bgcolor: theme.palette.success.main,
                                  '&:hover': {
                                    bgcolor: theme.palette.success.dark,
                                  }
                                }}
                              >
                                <Group fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" sx={{ py: 3 }}>
                            No projects found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
          {/* Recent Employees Table */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
            }}
          >            <CardHeader 
              title={
                <Box display="flex" alignItems="center">
                  <Group sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Recent Employees
                  </Typography>
                </Box>
              }
              sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
                background: alpha(theme.palette.primary.main, 0.05),
                '& .MuiCardHeader-action': {
                  margin: 0,
                  alignSelf: 'center',
                }
              }}
              action={                <Button
                  component={Link}
                  to="/employees"
                  endIcon={<ArrowForwardIcon />}
                  color="primary"
                  variant="text"
                  sx={{ fontWeight: 500 }}
                >
                  View All
                </Button>
              }
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer 
                sx={{
                  maxHeight: 360,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.info.main, 0.2),
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: alpha(theme.palette.info.main, 0.3),
                  },
                  '&::-webkit-scrollbar-track': {
                    background: alpha(theme.palette.background.paper, 0.1),
                    borderRadius: '4px',
                  },
                }}
              >
                <Table sx={{ minWidth: 500 }} aria-label="recent employees table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentEmployees.length > 0 ? (
                      recentEmployees.map((employee, index) => (
                        <TableRow
                          key={employee.id}
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.info.main, 0.04),
                            },
                          }}
                          component={motion.tr}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 1,
                                  bgcolor: employee.role === 'project_manager' ? theme.palette.primary.main : theme.palette.info.main,
                                  fontSize: '0.875rem',
                                  fontWeight: 600
                                }}
                              >
                                {employee.full_name?.charAt(0) || "U"}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {employee.full_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {employee.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>                              <Chip
                              size="small"
                              label={employee.role === 'project_manager' ? 'Project Manager' : 'Employee'}
                              sx={{ 
                                fontWeight: 500, 
                                color: 'white',
                                bgcolor: employee.role === 'project_manager' ? theme.palette.primary.main : theme.palette.info.main,
                              }}
                            />
                          </TableCell>
                          <TableCell>                            <IconButton
                              size="small"
                              component={Link}
                              to={`/employees/${employee.id}`}
                              sx={{
                                color: 'white',                                bgcolor: theme.palette.info.main,
                                '&:hover': {
                                  bgcolor: theme.palette.info.dark,
                                }
                              }}
                            >
                              <Person fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" sx={{ py: 3 }}>
                            No employees found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }} justifyContent="center" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">        <Grid item xs={12} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
            }}
          >            <CardHeader 
              title={
                <Box display="flex" alignItems="center">
                  <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Quick Actions
                  </Typography>
                </Box>
              }
              sx={{ 
                borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
                background: alpha(theme.palette.primary.main, 0.05),
                '& .MuiCardHeader-action': {
                  margin: 0,
                  alignSelf: 'center',
                }
              }}
            />
            <CardContent sx={{ p: 3, background: alpha(theme.palette.background.default, 0.3) }}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6} sm={3}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>                    <Button
                      component={Link}
                      to="/create-project"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{ 
                        py: 1.75,
                        backgroundImage: gradientStyles.primary,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        px: 3, 
                        boxShadow: theme.shadows[4],
                      }}
                      startIcon={
                        <AddCircle sx={{ 
                          fontSize: '1.75rem',
                          mr: 1,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          p: 0.75,
                          borderRadius: 1 
                        }} />                      }
                    >
                      <Box textAlign="left">
                        <Typography variant="body1" fontWeight={600}>
                          New Project
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Create new project
                        </Typography>
                      </Box>
                    </Button>
                  </motion.div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>                    <Button
                      component={Link}
                      to="/register-employee"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{ 
                        py: 1.75,
                        backgroundImage: gradientStyles.success,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        px: 3, 
                        boxShadow: theme.shadows[4],
                      }}
                      startIcon={
                        <Person sx={{ 
                          fontSize: '1.75rem',
                          mr: 1,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          p: 0.75,
                          borderRadius: 1 
                        }} />                      }
                    >
                      <Box textAlign="left">
                        <Typography variant="body1" fontWeight={600}>
                          New Employee
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Register new employee
                        </Typography>
                      </Box>
                    </Button>
                  </motion.div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>                    <Button
                      component={Link}
                      to="/resource-optimization"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{ 
                        py: 1.75,
                        backgroundImage: gradientStyles.info,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        px: 3, 
                        boxShadow: theme.shadows[4],
                      }}
                      startIcon={
                        <Tune sx={{ 
                          fontSize: '1.75rem',
                          mr: 1,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          p: 0.75,
                          borderRadius: 1 
                        }} />                      }
                    >
                      <Box textAlign="left">
                        <Typography variant="body1" fontWeight={600}>
                          Optimization
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Resource allocation tools
                        </Typography>
                      </Box>
                    </Button>
                  </motion.div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>                    <Button
                      component={Link}
                      to="/employee-matching"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{ 
                        py: 1.75,
                        backgroundImage: gradientStyles.warning,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        px: 3, 
                        boxShadow: theme.shadows[4],
                      }}
                      startIcon={
                        <Group sx={{ 
                          fontSize: '1.75rem',
                          mr: 1,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          p: 0.75,
                          borderRadius: 1 
                        }} />                      }
                    >
                      <Box textAlign="left">
                        <Typography variant="body1" fontWeight={600}>
                          Matching
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Find optimal employees
                        </Typography>
                      </Box>
                    </Button>
                  </motion.div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
