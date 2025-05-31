import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemText,
  Divider,
  Link,
  Stack,
  FormHelperText,
  alpha,
  useTheme,
  ButtonGroup,
  Avatar,
  Container
} from "@mui/material";
import {
  PeopleAlt as PeopleAltIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Done as DoneIcon,
  Block as BlockIcon,
  Autorenew as AutorenewIcon,
  Engineering as EngineeringIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AssignmentLate as AssignmentLateIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Work as WorkIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const ResourceOptimization = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [allocatedProjects, setAllocatedProjects] = useState([]);
  const [nonAllocatedProjects, setNonAllocatedProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [projectToReactivate, setProjectToReactivate] = useState(null);
  const [reactivateStatus, setReactivateStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE_URL = "http://localhost:8000/api";

  // Animation variants
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

  // Define gradient styles
  const gradientStyles = {
    primary: theme.palette.gradients?.primary || 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
    success: theme.palette.gradients?.success || 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
    info: theme.palette.gradients?.info || 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)',
    warning: theme.palette.gradients?.warning || 'linear-gradient(45deg, #D97706 30%, #F59E0B 90%)',
    secondary: theme.palette.gradients?.secondary || 'linear-gradient(45deg, #DB2777 30%, #EC4899 90%)',
  };

  const refreshProjectData = async () => {
    try {
      setLoading(true);
      const allProjectsResponse = await fetch(`${API_BASE_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (allProjectsResponse.ok) {
        const allProjects = await allProjectsResponse.json();
        setProjects(allProjects);

        const allocated = [];
        const nonAllocated = [];
        const completed = [];

        allProjects.forEach((project) => {
          if (project.status === "completed") {
            completed.push(project);
          } else if (project.resource_allocations && project.resource_allocations.length > 0) {
            allocated.push(project);
          } else {
            nonAllocated.push(project);
          }
        });

        setAllocatedProjects(allocated);
        setNonAllocatedProjects(nonAllocated);
        setCompletedProjects(completed);
      } else {
        setError("Failed to fetch projects. Please try again.");
      }
    } catch (error) {
      console.error("Error refreshing project data:", error);
      setError("An error occurred while fetching projects data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refreshProjectData();
    // Removed auto-refresh interval to prevent constant reloading
  }, []);
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setError(null);
    setSuccess(null);
  };

  const getProjectAllocationStatus = (project) => {
    if (!project.skill_requirements || !project.resource_allocations) {
      return "Not Allocated";
    }

    let totalRequired = 0;
    project.skill_requirements.forEach((req) => {
      totalRequired += req.employees_requested;
    });

    const uniqueEmployees = new Set(
      project.resource_allocations.map((allocation) => allocation.employee_id)
    );

    if (uniqueEmployees.size === 0) {
      return "Not Allocated";
    } else if (uniqueEmployees.size >= totalRequired) {
      return "Fully Allocated";
    } else {
      return "Partially Allocated";
    }
  };

  const getAllocationStatusColor = (status) => {
    switch (status) {
      case "Fully Allocated": return theme.palette.success.main;
      case "Partially Allocated": return theme.palette.warning.main;
      default: return theme.palette.error.main;
    }
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case "active": return theme.palette.success.main;
      case "planning": return theme.palette.info.main;
      case "completed": return theme.palette.grey[500];
      case "on-hold": return theme.palette.warning.main;
      default: return theme.palette.info.main;
    }
  };

  const handleReactivateProject = async (projectId, newStatus = "planning") => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        setSuccess(`Project successfully reactivated with status: ${newStatus}`);
        refreshProjectData();

        setTimeout(() => {
          setSuccess(null);
          setProjectToReactivate(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(`Failed to reactivate project: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error reactivating project:", error);
      setError("An error occurred while reactivating the project");
    }
  };

  const handleRemoveAllocation = async (projectId, employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/remove-allocation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ employee_id: employeeId }),
      });

      if (response.ok) {
        refreshProjectData(); // Refresh data after removal
        setSuccess("Allocation successfully removed!");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to remove allocation");
      }
    } catch (error) {
      console.error("Error removing allocation:", error);
      setError("An error occurred while removing the allocation");
    }
  };

  const formatMatchScore = (score) => {
    return (score * 100).toFixed(1);
  }; if (loading) {
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
            Loading resources...
          </Typography>
        </motion.div>
      </Box>
    );
  }
  if (error && !success) {
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
    <Container maxWidth="lg" sx={{ pb: 5, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>      <Box sx={{ textAlign: 'center', mb: 4, width: '100%' }}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >        <Typography
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
          Project Overview
        </Typography></motion.div>
    </Box>{error && (
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
            mb: 4
          }}
        >
          {error}
        </Alert>
      </motion.div>
    )}

      {success && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert
            severity="success"
            variant="filled"
            sx={{
              mb: 4,
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            {success}
          </Alert>
        </motion.div>
      )}

      {reactivateStatus && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert
            severity="info"
            variant="filled"
            sx={{
              mb: 4,
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            {reactivateStatus}
          </Alert>
        </motion.div>      )}      <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: '90%', mx: 'auto' }}>        
        {/* Project Management Section - Horizontal Layout */}
        <Grid item xs={12}>          <Grid 
            container 
            spacing={3} 
            direction="row" 
            alignItems="stretch" 
            justifyContent="center" 
            sx={{ width: '100%', mb: 4, mx: 'auto' }}>{/* Allocated Projects */}
            <Grid item xs={12} sm={10} md={3.5} component={motion.div} variants={itemVariants}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease-in-out',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AssignmentTurnedInIcon sx={{ color: theme.palette.success.light, mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Allocated Projects
                      </Typography>
                    </Box>
                  }
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                  sx={{
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: alpha(theme.palette.success.main, 0.05),
                    '& .MuiCardHeader-title': {
                      color: theme.palette.success.light,
                      textAlign: 'center'
                    },                    p: 2
                  }}
                />
                <CardContent sx={{ p: 2, flexGrow: 1 }}>
                  {allocatedProjects.length > 0 ? (                    <Stack spacing={1} sx={{ p: 1, maxHeight: 400, overflowY: 'auto' }}>
                      {allocatedProjects.map((project) => (
                        <Paper
                          key={project.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            boxShadow: theme.shadows[2],
                            background: alpha(theme.palette.background.paper, 0.8),
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: theme.shadows[3],
                              bgcolor: alpha(theme.palette.success.main, 0.05)
                            }
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {project.name}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                            <Chip
                              size="small"
                              label={project.status}
                              sx={{
                                bgcolor: alpha(getProjectStatusColor(project.status), 0.1),
                                color: getProjectStatusColor(project.status),
                                fontWeight: 500,
                              }}
                            />
                            <Chip
                              size="small"
                              label={getProjectAllocationStatus(project)}
                              sx={{
                                bgcolor: alpha(getAllocationStatusColor(getProjectAllocationStatus(project)), 0.1),
                                color: getAllocationStatusColor(getProjectAllocationStatus(project)),
                                fontWeight: 500,
                              }}
                            />
                          </Box>

                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Requirements:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                            {project.skill_requirements?.map((req) => (
                              <Chip
                                key={req.skill_id}
                                size="small"
                                label={`Skill #${req.skill_id}: ${req.employees_requested}`}
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                          </Box>

                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Employees Allocated:</strong> {project.resource_allocations?.length || 0}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                            {project.resource_allocations?.map(allocation => (
                              <Chip
                                key={allocation.id}
                                size="small"
                                label={`Employee #${allocation.employee_id} (${allocation.allocation_percentage}%)`}
                                color="info"
                                onClick={() => navigate(`/employees/${allocation.employee_id}`)}
                                onDelete={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAllocation(project.id, allocation.employee_id);
                                }}
                                deleteIcon={<CloseIcon fontSize="small" />}
                                sx={{
                                  '& .MuiChip-deleteIcon': {
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                      color: theme.palette.error.dark,
                                    }
                                  }
                                }}
                              />
                            ))}
                          </Box>

                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            component={RouterLink}
                            to={`/employee-matching/${project.id}`}
                            startIcon={<EngineeringIcon fontSize="small" />}
                            sx={{
                              py: 0.8,
                              borderRadius: 1.5,
                              textTransform: 'none',
                              fontWeight: 500,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.05),
                              }
                            }}
                          >
                            Manage Allocations
                          </Button>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography color="text.secondary">No allocated projects available.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>            </Grid>            {/* Projects Without Allocations */}
            <Grid item xs={12} sm={10} md={3.5} component={motion.div} variants={itemVariants}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease-in-out',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AssignmentLateIcon sx={{ color: theme.palette.warning.light, mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Projects Without Allocations
                      </Typography>
                    </Box>
                  }
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                  sx={{
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: alpha(theme.palette.warning.main, 0.05),
                    '& .MuiCardHeader-title': {
                      color: theme.palette.warning.light,
                      textAlign: 'center'
                    },                    p: 2
                  }}
                />
                <CardContent sx={{ p: 2, flexGrow: 1 }}>
                  {nonAllocatedProjects.length > 0 ? (                    <Stack spacing={1} sx={{ p: 1, maxHeight: 400, overflowY: 'auto' }}>
                      {nonAllocatedProjects.map((project) => (
                        <Paper
                          key={project.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            boxShadow: theme.shadows[2],
                            background: alpha(theme.palette.background.paper, 0.8),
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: theme.shadows[3],
                              bgcolor: alpha(theme.palette.warning.main, 0.05)
                            }
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {project.name}
                          </Typography>
                          <Box sx={{ my: 1 }}>
                            <Chip
                              size="small"
                              label={project.status}
                              sx={{
                                bgcolor: alpha(getProjectStatusColor(project.status), 0.1),
                                color: getProjectStatusColor(project.status),
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                          <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            component={RouterLink}
                            to={`/employee-matching/${project.id}`}
                            startIcon={<PersonAddIcon fontSize="small" />}
                            sx={{
                              py: 0.8,
                              borderRadius: 1.5,
                              textTransform: 'none',
                              fontWeight: 500,
                              background: gradientStyles.warning,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: theme.shadows[3],
                              }
                            }}
                          >
                            Allocate Resources
                          </Button>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">No projects without allocations.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>            </Grid>            {/* Completed Projects */}
            <Grid item xs={12} sm={10} md={3.5} component={motion.div} variants={itemVariants}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease-in-out',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DoneIcon sx={{ color: theme.palette.grey[400], mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Completed Projects
                      </Typography>
                    </Box>
                  }
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                  sx={{
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: alpha(theme.palette.grey[500], 0.05),
                    '& .MuiCardHeader-title': {
                      color: theme.palette.grey[400],
                      textAlign: 'center'
                    },                    p: 2
                  }}
                />
                <CardContent sx={{ p: 2, flexGrow: 1 }}>
                  {completedProjects.length > 0 ? (                    <Stack spacing={1} sx={{ p: 2, maxHeight: 400, overflowY: 'auto' }}>
                      {completedProjects.map((project) => (
                        <Paper
                          key={project.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            boxShadow: theme.shadows[2],
                            background: alpha(theme.palette.background.paper, 0.8),
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: theme.shadows[3],
                              bgcolor: alpha(theme.palette.grey[500], 0.05)
                            }
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {project.name}
                          </Typography>
                          <Box sx={{ my: 1 }}>
                            <Chip
                              size="small"
                              label="Completed"
                              sx={{
                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                                color: theme.palette.grey[500],
                                fontWeight: 500,
                              }}
                            />
                          </Box>

                          {projectToReactivate === project.id ? (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Reactivate this project as:
                              </Typography>
                              <ButtonGroup size="small" variant="outlined">
                                <Button
                                  onClick={() => handleReactivateProject(project.id, "planning")}
                                  startIcon={<AutorenewIcon fontSize="small" />}
                                  color="primary"
                                >
                                  Planning
                                </Button>
                                <Button
                                  onClick={() => handleReactivateProject(project.id, "active")}
                                  startIcon={<AutorenewIcon fontSize="small" />}
                                  color="warning"
                                >
                                  Active
                                </Button>
                                <Button
                                  onClick={() => setProjectToReactivate(null)}
                                  color="inherit"
                                >
                                  Cancel
                                </Button>
                              </ButtonGroup>
                            </Box>
                          ) : (
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => setProjectToReactivate(project.id)}
                              startIcon={<AutorenewIcon fontSize="small" />}
                              sx={{
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 500,
                              }}
                            >
                              Reactivate Project
                            </Button>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">No completed projects available.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ResourceOptimization;