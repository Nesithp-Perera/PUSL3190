import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthContext from "../context/AuthContext";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
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
  alpha,
  IconButton,
  Tooltip,
  Container
} from "@mui/material";
import {
  Work as WorkIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon,
  InfoOutlined as InfoOutlinedIcon
} from "@mui/icons-material";

const EmployeeProjects = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        console.log("Fetching employee projects...");
        
        const projectsResponse = await fetch(`http://localhost:8000/api/auth/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (projectsResponse.ok) {
          const userData = await projectsResponse.json();
          console.log("User data received:", userData);
          
          if (userData.projects && Array.isArray(userData.projects)) {
            console.log(`Found ${userData.projects.length} projects in user data`);
            setProjects(userData.projects);
          } else {
            console.log("No projects found in user data");
            setProjects([]);
          }
        } else {
          console.error("Failed to fetch projects:", await projectsResponse.text());
          throw new Error("Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load your projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.id) {
      fetchProjects();
    }
  }, [user]);

  const activeProjects = Array.isArray(projects) ? projects.filter(p => p && p.status === "active") : [];
  const plannedProjects = Array.isArray(projects) ? projects.filter(p => p && (p.status === "planning" || p.status === "planned")) : [];
  const completedProjects = Array.isArray(projects) ? projects.filter(p => p && p.status === "completed") : [];
  
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
  
  const gradientStyles = {
    primary: theme.palette.gradients?.primary || 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
    success: theme.palette.gradients?.success || 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
    info: theme.palette.gradients?.info || 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)',
    warning: theme.palette.gradients?.warning || 'linear-gradient(45deg, #D97706 30%, #F59E0B 90%)',
    secondary: theme.palette.gradients?.secondary || 'linear-gradient(45deg, #DB2777 30%, #EC4899 90%)',
  };

  const getStatusGradient = (status) => {
    switch(status) {
      case 'active': return gradientStyles.success;
      case 'completed': return 'linear-gradient(45deg, #9CA3AF 30%, #D1D5DB 90%)';
      default: return gradientStyles.warning;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderProjectTable = (projectList) => (
    <TableContainer 
      component={Paper}
      sx={{
        boxShadow: 'none',
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Your Allocation</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projectList.map((project, index) => {
            const allocationPercentage = project.employee_allocation !== undefined ? 
                                       project.employee_allocation : 
                                       (project.resource_allocations?.find(
                                          alloc => alloc.employee_id === user.id
                                       )?.allocation_percentage || 'N/A');
            
            return (
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
                <TableCell>{formatDate(project.start_date)}</TableCell>
                <TableCell>{formatDate(project.end_date)}</TableCell>
                <TableCell>{typeof allocationPercentage === 'number' ? `${allocationPercentage}%` : allocationPercentage}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton 
                      component={Link}
                      to={`/employee-projects/${project.id}`}
                      size="small"
                      sx={{
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        }
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 500, opacity: 0.9, textAlign: 'center' }}>
            Loading your projects...
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

  return (
    <Container maxWidth="lg" sx={{ pb: 5 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            My Projects
          </Typography>
        </motion.div>
      </Box>
      
      <Grid container spacing={3} justifyContent="center" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={4}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.8)}, ${alpha(theme.palette.success.main, 0.7)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.success.light, 0.2)}`,
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Box 
                  sx={{
                    mx: 'auto',
                    width: 56,
                    height: 56,
                    background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.light})`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: `0 4px 20px 0 ${alpha(theme.palette.success.main, 0.4)}`,
                  }}
                >
                  <WorkIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
              </motion.div>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
                Active Projects
              </Typography>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                  {activeProjects.length}
                </Typography>
              </motion.div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={4}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0.8)}, ${alpha(theme.palette.warning.main, 0.7)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.warning.light, 0.2)}`,
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Box 
                  sx={{
                    mx: 'auto',
                    width: 56,
                    height: 56,
                    background: `linear-gradient(135deg, ${theme.palette.warning.dark}, ${theme.palette.warning.light})`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: `0 4px 20px 0 ${alpha(theme.palette.warning.main, 0.4)}`,
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
              </motion.div>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
                Planned Projects
              </Typography>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                  {plannedProjects.length}
                </Typography>
              </motion.div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={4}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.grey[700], 0.8)}, ${alpha(theme.palette.grey[500], 0.7)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.grey[400], 0.2)}`,
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Box 
                  sx={{
                    mx: 'auto',
                    width: 56,
                    height: 56,
                    background: `linear-gradient(135deg, ${theme.palette.grey[700]}, ${theme.palette.grey[400]})`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: `0 4px 20px 0 ${alpha(theme.palette.grey[700], 0.4)}`,
                  }}
                >
                  <WorkIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
              </motion.div>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
                Completed Projects
              </Typography>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                  {completedProjects.length}
                </Typography>
              </motion.div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!Array.isArray(projects) || projects.length === 0 ? (
        <Box sx={{ mt: 4, maxWidth: '800px', mx: 'auto' }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Alert 
              severity="info" 
              variant="filled"
              icon={<WorkIcon fontSize="inherit" />}
              sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                backgroundImage: gradientStyles.info,
                textAlign: 'center'
              }}
            >
              You have not been assigned to any projects yet.
            </Alert>
          </motion.div>
        </Box>
      ) : (
        <Grid container spacing={4} sx={{ mt: 2 }} justifyContent="center" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          {activeProjects.length > 0 && (
            <Grid item xs={12} component={motion.div} variants={itemVariants}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardHeader 
                  title="Active Projects"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                  sx={{ 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: alpha(theme.palette.success.main, 0.05),
                    '& .MuiCardHeader-title': {
                      color: theme.palette.success.light,
                      textAlign: 'center'
                    },
                    textAlign: 'center'
                  }}
                />
                <CardContent sx={{ p: 0 }}>
                  {renderProjectTable(activeProjects)}
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {plannedProjects.length > 0 && (
            <Grid item xs={12} component={motion.div} variants={itemVariants}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardHeader 
                  title="Planned Projects"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                  sx={{ 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: alpha(theme.palette.warning.main, 0.05),
                    '& .MuiCardHeader-title': {
                      color: theme.palette.warning.light,
                      textAlign: 'center'
                    },
                    textAlign: 'center'
                  }}
                />
                <CardContent sx={{ p: 0 }}>
                  {renderProjectTable(plannedProjects)}
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {completedProjects.length > 0 && (
            <Grid item xs={12} component={motion.div} variants={itemVariants}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardHeader 
                  title="Completed Projects"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                  sx={{ 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: alpha(theme.palette.grey[500], 0.05),
                    '& .MuiCardHeader-title': {
                      color: theme.palette.grey[400],
                      textAlign: 'center'
                    },
                    textAlign: 'center'
                  }}
                />
                <CardContent sx={{ p: 0 }}>
                  {renderProjectTable(completedProjects)}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default EmployeeProjects;
