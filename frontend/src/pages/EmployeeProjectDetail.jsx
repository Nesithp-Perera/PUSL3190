import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthContext from "../context/AuthContext";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  CircularProgress,
  LinearProgress,
  Alert,
  Divider,
  Avatar,
  Paper,
  useTheme,
  alpha,
  Tooltip
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  Group as GroupIcon
} from "@mui/icons-material";

const EmployeeProjectDetail = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          throw new Error("Failed to fetch project details");
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        setError(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return theme.palette.success.main;
      case 'completed': return theme.palette.grey[500];
      default: return theme.palette.warning.main;
    }
  };

  const getStatusGradient = (status) => {
    switch(status) {
      case 'active': return 'linear-gradient(45deg, #059669 30%, #10B981 90%)';
      case 'completed': return 'linear-gradient(45deg, #9CA3AF 30%, #D1D5DB 90%)';
      default: return 'linear-gradient(45deg, #D97706 30%, #F59E0B 90%)';
    }
  };
  
  const calculateDaysRemaining = (endDateStr) => {
    const endDate = new Date(endDateStr);
    const currentDate = new Date();
    const differenceInTime = endDate - currentDate;
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };
  
  const calculateProgress = (startDateStr, endDateStr) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const currentDate = new Date();
    
    const totalDuration = endDate - startDate;
    const elapsedTime = currentDate - startDate;
    
    let progress = Math.floor((elapsedTime / totalDuration) * 100);
    progress = Math.max(0, Math.min(progress, 100));
    
    return progress;
  };

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
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 500, opacity: 0.9, textAlign: 'center' }}>
            Loading project details...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          variant="filled"
          action={
            <Button color="inherit" onClick={() => navigate("/employee-projects")}>
              Go Back
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button color="inherit" onClick={() => navigate("/employee-projects")}>
              Go Back
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          Project not found
        </Alert>
      </Box>
    );
  }

  const daysRemaining = calculateDaysRemaining(project.end_date);
  const progress = calculateProgress(project.start_date, project.end_date);

  const myAllocation = project.resource_allocations?.find(
    allocation => allocation.employee_id === user.id
  );

  return (
    <Box sx={{ pb: 5 }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 16 }}
      >
        <Button
          component={Link}
          to="/employee-projects"
          startIcon={<ArrowBackIcon />}
          variant="text"
          color="primary"
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>
      </motion.div>
      
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
            mb: 1,
            fontWeight: 700,
            letterSpacing: '0.02em',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {project.name}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 4, alignItems: 'center' }}>
          <Chip
            label={project.status}
            size="medium"
            sx={{ 
              fontWeight: 500, 
              color: 'white',
              background: getStatusGradient(project.status),
              px: 1
            }}
          />
          <Typography variant="subtitle1" color="text.secondary">
            {project.department} Department
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3} justifyContent="center" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={4}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.primary.main, 0.7)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  component={CalendarIcon}
                  sx={{
                    mr: 2,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
                    boxShadow: `0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                    color: 'white',
                    borderRadius: '50%',
                    p: 1.2
                  }}
                />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                    Timeline
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Project duration and progress
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Start Date
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    {new Date(project.start_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    End Date
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    {new Date(project.end_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {daysRemaining > 0 ? 'Days Remaining' : 'Days Overdue'}
                  </Typography>
                  <Chip
                    label={`${Math.abs(daysRemaining)} days`}
                    size="small"
                    sx={{
                      bgcolor: daysRemaining > 0 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(239, 68, 68, 0.4)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Progress
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

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
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  component={AssignmentTurnedInIcon}
                  sx={{
                    mr: 2,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.light})`,
                    boxShadow: `0 4px 20px 0 ${alpha(theme.palette.success.main, 0.4)}`,
                    color: 'white',
                    borderRadius: '50%',
                    p: 1.2
                  }}
                />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                    My Role
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Your assignment details
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

              {myAllocation ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Role
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                        {myAllocation.role || "Team Member"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Status
                      </Typography>
                      <Chip
                        label={myAllocation.status || "Active"}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Allocation
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                        {myAllocation.allocation_percentage || 100}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Performance Rating
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {myAllocation.performance_rating ? `${myAllocation.performance_rating}/5` : "Not rated yet"}
                      </Typography>
                    </Box>
                    {myAllocation.performance_rating && (
                      <LinearProgress
                        variant="determinate"
                        value={(myAllocation.performance_rating / 5) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'white',
                          }
                        }}
                      />
                    )}
                  </Box>
                </>
              ) : (
                <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', py: 3 }}>
                  No assignment details found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={4}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.8)}, ${alpha(theme.palette.info.main, 0.7)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.info.light, 0.2)}`,
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  component={GroupIcon}
                  sx={{
                    mr: 2,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    background: `linear-gradient(135deg, ${theme.palette.info.dark}, ${theme.palette.info.light})`,
                    boxShadow: `0 4px 20px 0 ${alpha(theme.palette.info.main, 0.4)}`,
                    color: 'white',
                    borderRadius: '50%',
                    p: 1.2
                  }}
                />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                    Team
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Project team members
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

              {project.resource_allocations && project.resource_allocations.length > 0 ? (
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                    Team Size: {project.resource_allocations.length} members
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {project.resource_allocations.map((allocation, index) => (
                      <Tooltip 
                        key={index}
                        title={allocation.employee_name || `Employee #${allocation.employee_id}`} 
                        arrow
                      >
                        <Avatar 
                          sx={{ 
                            width: 36, 
                            height: 36,
                            bgcolor: allocation.employee_id === user.id ? theme.palette.warning.main : 'rgba(255, 255, 255, 0.2)',
                            border: allocation.employee_id === user.id ? '2px solid white' : 'none',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            boxShadow: allocation.employee_id === user.id ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none'
                          }}
                        >
                          {allocation.employee_name?.charAt(0) || "E"}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', py: 3 }}>
                  No team members found
                </Typography>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  Project Manager
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36,
                      bgcolor: theme.palette.secondary.main,
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {project.manager_name?.charAt(0) || "M"}
                  </Avatar>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                    {project.manager_name || "Unnamed Manager"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
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
              title="Project Details" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              sx={{ 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: alpha(theme.palette.primary.main, 0.05)
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      background: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {project.description || "No description available."}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      background: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Required Skills
                    </Typography>
                    
                    {project.required_skills && project.required_skills.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {project.required_skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={typeof skill === 'object' ? skill.name : skill}
                            size="medium"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              }
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body1">
                        No specific skills required.
                      </Typography>
                    )}

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        Department & Priority
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Chip
                          label={project.department || "Unassigned"}
                          size="medium"
                          icon={<BusinessIcon />}
                          sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            fontWeight: 500,
                            '& .MuiChip-icon': { 
                              color: theme.palette.secondary.main
                            }
                          }}
                        />
                        
                        <Chip
                          label={`Priority: ${project.priority || "Medium"}`}
                          size="medium"
                          icon={<BarChartIcon />}
                          sx={{
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                            fontWeight: 500,
                            '& .MuiChip-icon': { 
                              color: theme.palette.warning.main
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 2, 
                      borderRadius: 2,
                      background: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Tasks and Responsibilities
                    </Typography>
                    
                    {myAllocation && myAllocation.responsibilities ? (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {myAllocation.responsibilities}
                      </Typography>
                    ) : project.tasks ? (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {project.tasks}
                      </Typography>
                    ) : (
                      <Typography variant="body1">
                        No specific tasks or responsibilities have been assigned yet.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeProjectDetail;
