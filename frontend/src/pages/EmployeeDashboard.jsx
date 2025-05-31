import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  AccountTree as AccountTreeIcon,
  Assignment as AssignmentIcon,
  ViewList as ViewListIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

const EmployeeDashboard = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [employeeData, setEmployeeData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!user || !user.id) {
          setError("User information not available");
          setLoading(false);
          return;
        }
        
        console.log("Fetching employee data...");
        const employeeResponse = await fetch(`http://localhost:8000/api/auth/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (employeeResponse.ok) {
          const empData = await employeeResponse.json();
          console.log("Employee data received:", empData);
          setEmployeeData(empData);
          
          // Extract projects from employee data if they exist
          if (empData.projects && Array.isArray(empData.projects)) {
            setProjects(empData.projects);
          } else {
            // If no projects in employee data, try fetching them directly
            const projectsResponse = await fetch(`http://localhost:8000/api/projects/employee`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            
            if (projectsResponse.ok) {
              const projectsData = await projectsResponse.json();
              setProjects(Array.isArray(projectsData) ? projectsData : []);
            }
          }
        } else {
          setError("Failed to fetch employee data");
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError("An error occurred while loading your dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Animation variants for staggered animations
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

  // Get project counts by status
  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const plannedProjects = projects.filter(p => p.status === "planning" || p.status === "planned").length;

  // Get gradient styles from theme
  const gradientStyles = {
    primary: theme.palette.gradients?.primary || 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
    success: theme.palette.gradients?.success || 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
    info: theme.palette.gradients?.info || 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)',
    warning: theme.palette.gradients?.warning || 'linear-gradient(45deg, #D97706 30%, #F59E0B 90%)',
    secondary: theme.palette.gradients?.secondary || 'linear-gradient(45deg, #DB2777 30%, #EC4899 90%)',
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

  if (!employeeData) {
    return (
      <Box m={3}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert
            severity="warning"
            variant="filled"
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            Could not find your employee data. Please contact your administrator.
          </Alert>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Header Section */}
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
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
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
                {employeeData.full_name?.[0] || "U"}
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
                  Welcome, {employeeData.full_name || "User"}!
                </Typography>
                
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                >
                  {employeeData.position ? `${employeeData.position}` : ""}
                  {employeeData.position && employeeData.department ? " | " : ""}
                  {employeeData.department ? `${employeeData.department} Department` : ""}
                </Typography>
              </Box>
            </Box>

            {employeeData.availability_percentage !== undefined && (
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Current Availability
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    {employeeData.availability_percentage}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={employeeData.availability_percentage || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundImage: gradientStyles.info,
                    }
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
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
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                Projects Assigned
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
                  {projects.length}
                </Typography>
              </motion.div>
              <Typography variant="body2" color="text.secondary">
                {activeProjects} active, {plannedProjects} planned
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
              />
              <Typography variant="h5" component="div" gutterBottom fontWeight={700}>
                Skills
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
                  {employeeData.skills ? employeeData.skills.length : 0}
                </Typography>
              </motion.div>
              <Typography variant="body2" color="text.secondary">
                {employeeData.skills && employeeData.skills.length > 0 
                  ? "Skills in your profile" 
                  : "No skills added yet"}
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
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Box
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
                Performance
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
                  {employeeData.average_performance !== undefined 
                    ? Number(employeeData.average_performance).toFixed(1) 
                    : "N/A"}
                </Typography>
              </motion.div>
              <Typography variant="body2" color="text.secondary">
                Out of 5.0 performance score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delayChildren: 0.3 }}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <Card 
          sx={{ 
            mt: 4,
            overflow: 'visible',
            backgroundImage: 'none',
            width: '100%',
            maxWidth: '1200px',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0) 50%)',
              pointerEvents: 'none',
              borderRadius: 'inherit',
            }
          }} 
          component={motion.div} 
          variants={itemVariants}
        >
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <AccountTreeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="div" fontWeight={600}>
                  Your Projects
                </Typography>
              </Box>
            }
            action={
              <Button
                component={Link}
                to="/employee-projects"
                endIcon={<ArrowForwardIcon />}
                color="primary"
                variant="text"
              >
                View All
              </Button>
            }
            sx={{
              '& .MuiCardHeader-action': {
                margin: 0,
                alignSelf: 'center',
              }
            }}
          />

          <Divider sx={{ opacity: 0.6 }} />

          <CardContent sx={{ pt: 3 }}>
            {projects.length > 0 ? (
              <>
                <Box mb={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={500}>
                    Project Status Distribution
                  </Typography>
                  <Grid container spacing={2} mt={1} mb={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: `${projects.length ? (activeProjects / projects.length * 100) : 0}%`,
                            height: 24,
                            backgroundColor: 'transparent',
                            backgroundImage: gradientStyles.success,
                            borderRadius: '8px 0 0 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: activeProjects > 0 ? '40px' : '0px',
                            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: activeProjects > 0 ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: '#fff'
                          }}
                        >
                          {activeProjects > 0 && activeProjects}
                        </Box>
                        <Box
                          sx={{
                            width: `${projects.length ? (plannedProjects / projects.length * 100) : 0}%`,
                            height: 24,
                            backgroundColor: 'transparent',
                            backgroundImage: gradientStyles.warning,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: plannedProjects > 0 ? '40px' : '0px',
                            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: plannedProjects > 0 ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: '#fff'
                          }}
                        >
                          {plannedProjects > 0 && plannedProjects}
                        </Box>
                        <Box
                          sx={{
                            width: `${projects.length ? (completedProjects / projects.length * 100) : 0}%`,
                            height: 24,
                            backgroundColor: 'transparent',
                            backgroundImage: 'linear-gradient(45deg, #9CA3AF 30%, #D1D5DB 90%)',
                            borderRadius: '0 8px 8px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: completedProjects > 0 ? '40px' : '0px',
                            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: completedProjects > 0 ? '0 4px 12px rgba(156, 163, 175, 0.2)' : 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: '#fff'
                          }}
                        >
                          {completedProjects > 0 && completedProjects}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        <Chip 
                          sx={{ 
                            backgroundImage: gradientStyles.success,
                            color: '#fff', 
                            fontWeight: 500,
                            '& .MuiChip-label': { px: 1.5 }
                          }} 
                          size="small" 
                          label={`Active: ${activeProjects}`} 
                        />
                        <Chip 
                          sx={{ 
                            backgroundImage: gradientStyles.warning, 
                            color: '#fff', 
                            fontWeight: 500,
                            '& .MuiChip-label': { px: 1.5 }
                          }} 
                          size="small" 
                          label={`Planned: ${plannedProjects}`} 
                        />
                        <Chip 
                          sx={{ 
                            backgroundImage: 'linear-gradient(45deg, #9CA3AF 30%, #D1D5DB 90%)',
                            color: '#fff', 
                            fontWeight: 500,
                            '& .MuiChip-label': { px: 1.5 }
                          }} 
                          size="small" 
                          label={`Completed: ${completedProjects}`} 
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <TableContainer 
                  component={Paper}
                  sx={{
                    boxShadow: 'none',
                    backgroundColor: 'background.paper',
                    backgroundImage: 'none',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Table sx={{ minWidth: 500 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project Name</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projects.slice(0, 5).map((project, index) => (
                        <TableRow
                          key={project.id}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            animation: `fadeIn 0.5s ease-out ${0.1 * index}s both`,
                            '@keyframes fadeIn': {
                              '0%': { opacity: 0, transform: 'translateY(10px)' },
                              '100%': { opacity: 1, transform: 'translateY(0)' },
                            }
                          }}
                        >
                          <TableCell component="th" scope="row">
                            <Typography fontWeight={500}>{project.name}</Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(project.start_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(project.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={project.status}
                              size="small"
                              sx={{
                                backgroundImage: 
                                  project.status === 'active' ? gradientStyles.success :
                                  project.status === 'completed' ? 'linear-gradient(45deg, #9CA3AF 30%, #D1D5DB 90%)' :
                                  gradientStyles.warning,
                                color: '#fff',
                                fontWeight: 500,
                                px: 0.5
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton
                                component={Link}
                                to={`/employee-projects/${project.id}`}
                                size="small"
                                sx={{
                                  color: 'primary.main',
                                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                  }
                                }}
                              >
                                <ViewListIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Alert 
                severity="info" 
                icon={<WorkIcon fontSize="inherit" />}
                sx={{ borderRadius: 2 }}
              >
                You have not been assigned to any projects yet.
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile and Quick Actions */}
      <Grid 
        container 
        spacing={3} 
        sx={{ mt: 2 }}
        justifyContent="center"
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delayChildren: 0.6 }}
      >
        {/* Profile Overview */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h5" component="div" fontWeight={600}>
                    Your Profile
                  </Typography>
                </Box>
              }
              action={
                <Button
                  component={Link}
                  to="/employee-profile"
                  startIcon={<EditIcon />}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 6 }}
                >
                  Edit
                </Button>
              }
              sx={{
                backgroundImage: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(15, 23, 42, 0))',
                '& .MuiCardHeader-action': {
                  margin: 0,
                  alignSelf: 'center',
                }
              }}
            />

            <Divider sx={{ opacity: 0.6 }} />

            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Department
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {employeeData.department || "Not assigned"}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Position
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {employeeData.position || "Not specified"}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="h6" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                      {employeeData.email || "Not specified"}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Performance Score
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" fontWeight={600} sx={{ color: 'info.light' }}>
                        {employeeData.average_performance || "0"}/5
                      </Typography>
                      {employeeData.average_performance && (
                        <Chip
                          label={employeeData.average_performance >= 4 ? "Excellent" : employeeData.average_performance >= 3 ? "Good" : "Needs Improvement"}
                          size="small"
                          sx={{
                            backgroundImage: 
                              employeeData.average_performance >= 4 ? gradientStyles.success :
                              employeeData.average_performance >= 3 ? gradientStyles.info :
                              gradientStyles.warning,
                            color: '#fff',
                            fontWeight: 500,
                            height: 24
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Skills
                    </Typography>
                    {employeeData.skills && employeeData.skills.length > 0 ? (
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {employeeData.skills.slice(0, 5).map((skill, index) => (
                          <Chip
                            key={index}
                            label={typeof skill === 'object' ? skill.name : skill}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(59, 130, 246, 0.1)',
                              color: 'info.light',
                              borderRadius: 1.5,
                              fontSize: '0.75rem',
                              height: 24,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                bgcolor: 'rgba(59, 130, 246, 0.2)',
                              }
                            }}
                          />
                        ))}
                        {employeeData.skills.length > 5 && (
                          <Chip
                            label={`+${employeeData.skills.length - 5} more`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: 'rgba(59, 130, 246, 0.3)',
                              color: 'info.light',
                              borderRadius: 1.5,
                              fontSize: '0.75rem',
                              height: 24
                            }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No skills added yet
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>

            <CardActions sx={{ px: 3, pb: 3, pt: 1 }}>
              <Button
                component={Link}
                to="/employee-profile"
                variant="contained"
                color="info"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1,
                  backgroundImage: gradientStyles.info,
                }}
              >
                View Full Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <TimelineIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h5" component="div" fontWeight={600}>
                    Quick Actions
                  </Typography>
                </Box>
              }
              sx={{
                backgroundImage: 'linear-gradient(to right, rgba(236, 72, 153, 0.1), rgba(15, 23, 42, 0))',
              }}
            />

            <Divider sx={{ opacity: 0.6 }} />

            <CardContent 
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 3,
                pt: 2,
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0))',
              }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  component={Link}
                  to="/employee-projects"
                  variant="contained"
                  color="primary"
                  fullWidth
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
                    <WorkIcon sx={{ 
                      fontSize: '1.75rem',
                      mr: 1,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      p: 0.75,
                      borderRadius: 1 
                    }} />
                  }
                >
                  <Box textAlign="left">
                    <Typography variant="body1" fontWeight={600}>
                      View All Projects
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {projects.length} projects assigned to you
                    </Typography>
                  </Box>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  component={Link}
                  to="/employee-profile"
                  variant="contained"
                  color="info"
                  fullWidth
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
                    <PersonIcon sx={{ 
                      fontSize: '1.75rem',
                      mr: 1,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      p: 0.75,
                      borderRadius: 1 
                    }} />
                  }
                >
                  <Box textAlign="left">
                    <Typography variant="body1" fontWeight={600}>
                      Update Profile
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Edit your personal information and skills
                    </Typography>
                  </Box>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  component={Link}
                  to="/employee-performance"
                  variant="contained"
                  color="success"
                  fullWidth
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
                    <AssessmentIcon sx={{ 
                      fontSize: '1.75rem',
                      mr: 1,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      p: 0.75,
                      borderRadius: 1 
                    }} />
                  }
                >
                  <Box textAlign="left">
                    <Typography variant="body1" fontWeight={600}>
                      Performance Dashboard
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      View your performance metrics and insights
                    </Typography>
                  </Box>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
