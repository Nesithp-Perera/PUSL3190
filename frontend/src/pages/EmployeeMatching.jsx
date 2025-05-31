import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardHeader, 
  CardContent,
  CardActions,
  Button, 
  Chip, 
  Divider, 
  LinearProgress,
  IconButton,
  Alert,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress
} from "@mui/material";
import { 
  PeopleAlt as PeopleAltIcon, 
  Check as CheckIcon,
  AssignmentInd as AssignmentIndIcon,
  RemoveCircle as RemoveCircleIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const EmployeeMatching = () => {
  const theme = useTheme();
  const { projectId } = useParams();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || "");
  const [skillMatches, setSkillMatches] = useState({});
  const [allocations, setAllocations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [projectRequirements, setProjectRequirements] = useState([]);
  // Add recommendations state
  const [recommendations, setRecommendations] = useState([]);
  
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

  // Fetch all projects for the dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/projects", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Filter out completed projects
          const activeProjects = data.filter(project => project.status !== "completed");
          setProjects(activeProjects);
          
          // If no project is selected but we have projects, select the first one
          if (!selectedProject && activeProjects.length > 0) {
            setSelectedProject(activeProjects[0].id.toString());
          }
        } else {
          console.error("Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Could not load projects. Please try again later.");
      }
    };

    fetchProjects();
  }, [selectedProject]);

  const fetchProjectDetails = async (projectId) => {
    if (!projectId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const projectData = await response.json();
        
        // Fetch skill names for each requirement
        const requirementsWithSkillNames = [];
        for (const req of projectData.skill_requirements || []) {
          try {
            const skillResponse = await fetch(`http://localhost:8000/api/skills/${req.skill_id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            
            if (skillResponse.ok) {
              const skillData = await skillResponse.json();
              requirementsWithSkillNames.push({
                ...req,
                skill_name: skillData.name
              });
            } else {
              requirementsWithSkillNames.push({
                ...req,
                skill_name: `Skill #${req.skill_id}`
              });
            }
          } catch (error) {
            console.error(`Error fetching skill ${req.skill_id}:`, error);
            requirementsWithSkillNames.push({
              ...req,
              skill_name: `Skill #${req.skill_id}`
            });
          }
        }
        
        setProjectRequirements(requirementsWithSkillNames);
      } else {
        console.error("Failed to fetch project details");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };
  // Fetch matched employees when a project is selected
  useEffect(() => {
    const fetchSkillMatches = async () => {
      if (!selectedProject) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${selectedProject}/match-employees`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSkillMatches(data);
          
          // Reset allocations when project changes
          setAllocations([]);
          
          // Clear recommendations when project changes
          setRecommendations([]);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch skill matches:", errorText);
          setError(`Failed to fetch skill matches: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching skill matches:", error);
        setError("Could not connect to the server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (selectedProject) {
      fetchSkillMatches();
      fetchProjectDetails(selectedProject);
    }
  }, [selectedProject]);

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };
  const handleAllocationChange = (employeeId, employeeName, skillName, value, fromRecommendation = false) => {
    // Check if requirements for this skill are already met
    const skillRequirement = projectRequirements.find(req => req.skill_name === skillName);
    
    if (!skillRequirement) {
      setError(`Skill "${skillName}" is not required for this project.`);
      return;
    }
    
    // Get existing allocations for this skill from other employees
    const existingAllocationsForSkill = allocations.filter(
      a => a.skill_name === skillName && a.employee_id !== employeeId
    );
    
    // Count allocated employees for this skill in the database
    const allocatedEmployeesForSkill = Object.entries(skillMatches)
      .filter(([skill]) => skill === skillName)
      .reduce((count, [_, employees]) => {
        return count + employees.filter(emp => emp.allocated).length;
      }, 0);
    
    // Calculate total current allocation percentage for this skill
    let totalCurrentAllocation = 0;
    existingAllocationsForSkill.forEach(a => {
      totalCurrentAllocation += a.allocation_percentage;
    });
    
    // If skill requirement is already met by other employees, don't allow more allocations
    if (allocatedEmployeesForSkill >= skillRequirement.employees_requested) {
      setError(`Requirements for ${skillName} are already fully allocated to other employees.`);
      return;
    }
    
    // First remove any existing allocation for this employee and skill
    const updatedAllocations = allocations.filter(
      (a) => !(a.employee_id === employeeId && a.skill_name === skillName)
    );
    
    // Set the allocation value based on input
    let allocationValue;
    if (value === true || fromRecommendation === true && typeof value !== 'number') {
      // Default to 20% allocation if just a boolean is passed or from recommendation without value
      allocationValue = 20;
    } else if (typeof value === 'number' && value > 0) {
      // Use the passed numeric value
      allocationValue = value;
    } else if (parseFloat(value) > 0) {
      // Parse string value to number
      allocationValue = parseFloat(value);
    } else {
      return; // No valid allocation value
    }
    
    // Calculate remaining allocation percentage to not exceed 100%
    const remainingAllocation = 100 - totalCurrentAllocation;
    
    // Adjust allocation if needed to not exceed 100%
    if (allocationValue > remainingAllocation) {
      allocationValue = remainingAllocation;
      setSuccess(`Allocation adjusted to ${allocationValue}% to fit remaining requirement.`);
    }
    
    // Ensure allocation is at least 10%
    if (allocationValue < 10) {
      allocationValue = 10;
    }
    
    // Add the new allocation if the value is greater than 0
    if (allocationValue > 0) {
      updatedAllocations.push({
        employee_id: employeeId,
        employee_name: employeeName,
        skill_name: skillName,
        allocation_percentage: allocationValue,
      });
      
      setSuccess(`${employeeName} allocated to ${skillName} at ${allocationValue}% successfully!`);
    }
    
    setAllocations(updatedAllocations);      
    // Scroll to the selected allocations section
    setTimeout(() => {
      document.getElementById('selected-allocations')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleAllocate = async () => {
    if (allocations.length === 0) {
      setError("No allocations specified. Please specify allocation percentages first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${selectedProject}/allocate-employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ allocations }),
      });

      if (response.ok) {
        setSuccess("Employees successfully allocated to the project!");
        setAllocations([]);
        
        // Fetch updated skill matches immediately 
        fetchSkillMatches();
        
        // Clear recommendations to avoid stale data
        setRecommendations([]);
        
        // Show success message but don't reload page (better UX)
        setSuccess("Employees successfully allocated to the project!");
      } else {
        const errorData = await response.json();
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : 'Failed to allocate employees';
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error allocating employees:", error);
      setError("An error occurred while allocating employees. Please try again.");
    } finally {
      setLoading(false);
    }  };
  
  // Declare fetchSkillMatches function to be used in handleAllocate
  const fetchSkillMatches = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${selectedProject}/match-employees`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSkillMatches(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch skill matches:", errorText);
        setError(`Failed to fetch skill matches: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching skill matches:", error);
      setError("Could not connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new function to handle allocation removal
  const handleRemoveAllocation = async (employeeId, skillName) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${selectedProject}/remove-allocation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ employee_id: employeeId }),
      });

      if (response.ok) {
        // Fetch updated skill matches immediately
        fetchSkillMatches();
        
        // Show success message
        setSuccess("Employee allocation successfully removed!");
        
        // Clear recommendations to avoid stale data
        setRecommendations([]);
      } else {
        const errorData = await response.json();
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : 'Failed to remove allocation';
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error removing allocation:", error);
      setError("An error occurred while removing the allocation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations with skill mapping
  const fetchRecommendations = async () => {
    if (!selectedProject) {
      setError("Please select a project first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/ml/recommend-resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ project_id: parseInt(selectedProject) }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          // First get the skill allocation status
          const skillStatus = {};
          
          projectRequirements.forEach(req => {
            // Count allocated employees for this skill
            const allocatedCount = Object.entries(skillMatches)
              .filter(([skill]) => skill === req.skill_name)
              .reduce((count, [_, employees]) => {
                return count + employees.filter(emp => emp.allocated).length;
              }, 0);
              
            skillStatus[req.skill_name] = {
              allocated: allocatedCount,
              required: req.employees_requested,
              remaining: Math.max(0, req.employees_requested - allocatedCount)
            };
          });
          
          // Sort by match score and map recommendations to include best skill match
          const mappedRecommendations = data.recommendations
            .sort((a, b) => b.match_score - a.match_score)
            .map(rec => {
              // Find skills that still need employees
              const availableSkills = projectRequirements
                .filter(req => skillStatus[req.skill_name].remaining > 0)
                .map(req => req.skill_name);
                
              // If no skills need employees, show all skills
              const skillsToShow = availableSkills.length > 0 ? 
                availableSkills : 
                projectRequirements.map(req => req.skill_name);
                
              // Default to first skill if available, otherwise use first project requirement
              const bestSkill = skillsToShow.length > 0 ? 
                skillsToShow[0] : 
                projectRequirements.length > 0 ? 
                  projectRequirements[0].skill_name : "General";
              
              return {
                ...rec,
                skill_name: bestSkill,
                recommended_allocation: 20, // Start with 20% allocation
                available_skills: skillsToShow
              };
            });
          
          setRecommendations(mappedRecommendations);
          setSuccess("AI recommendations generated successfully!");
        } else {
          setError("No recommendations available for this project.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to get recommendations");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("An error occurred while getting recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the allocation status for all skills
  const getSkillAllocationStatus = () => {
    const status = {};
    
    projectRequirements.forEach(req => {
      // Count allocated employees for this skill
      const allocatedEmployees = Object.entries(skillMatches)
        .filter(([skill]) => skill === req.skill_name)
        .reduce((count, [_, employees]) => {
          return count + employees.filter(emp => emp.allocated).length;
        }, 0);
      
      // Count pending allocations (not yet saved)
      const pendingAllocations = allocations.filter(a => a.skill_name === req.skill_name).length;
      
      // Calculate total allocation
      const totalAllocation = allocatedEmployees + pendingAllocations;
      
      status[req.skill_name] = {
        allocated: allocatedEmployees,
        pending: pendingAllocations,
        total: totalAllocation,
        required: req.employees_requested,
        isFull: totalAllocation >= req.employees_requested
      };
    });
    
    return status;
  };

  // Helper function to format match score
  const formatMatchScore = (score) => {
    return Math.round(score * 100);
  };

  // Helper function to safely render error messages
  const renderErrorMessage = (errorMsg) => {
    if (typeof errorMsg === 'string') {
      return errorMsg;
    } else if (errorMsg && typeof errorMsg === 'object') {
      return JSON.stringify(errorMsg);
    }
    return "An unexpected error occurred";
  };  return (    <Box 
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      sx={{ 
        p: 3, 
        maxWidth: '1600px', 
        mx: 'auto', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <motion.div variants={itemVariants}>
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mb: 4
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              mb: 4,
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Employee Matching and Allocation
          </Typography>
        </Box>
      </motion.div>        <motion.div variants={itemVariants}>        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            background: `linear-gradient(to right bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 10px 15px -3px ${alpha(theme.palette.common.black, 0.1)}, 0 4px 6px -2px ${alpha(theme.palette.common.black, 0.05)}`,
            width: '100%'
          }}>
          <CardContent>
            <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
              <InputLabel id="project-select-label">Select Project</InputLabel>              <Select
                labelId="project-select-label"
                id="projectSelect"
                value={selectedProject}
                onChange={handleProjectChange}
                sx={{
                  borderRadius: 2,
                  '& .MuiFilledInput-input': {
                    borderRadius: 2,
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }
                }}
              >
                <MenuItem value="">-- Select a project --</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AssignmentIndIcon />}
              onClick={fetchRecommendations}
              disabled={!selectedProject || loading}
              fullWidth
              sx={{
                py: 1.2,
                mb: 3,
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                boxShadow: theme.shadows[3],
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[5],
                }
              }}
            >
              {loading ? "Generating recommendations..." : "Get AI Recommendations"}
            </Button>

            {recommendations.length > 0 && (
              <Box sx={{ mt: 4 }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 0.5,
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  }}
                >
                  AI Recommendations
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Employees are ranked by match score - Default allocation is 20%
                </Typography>                <TableContainer
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
                  <Table size="small">
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Match Score</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Available Hours</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Best Skill Match</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Explanation</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Allocation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>{recommendations.map((rec, index) => {
                        // Get project requirements to check which skills are needed
                        const requiredSkills = rec.available_skills || projectRequirements.map(req => req.skill_name);
                        
                        // Get real-time allocation status for all skills
                        const skillAllocationStatus = getSkillAllocationStatus();
                          // Determine row styling based on match score
                        const matchScoreValue = formatMatchScore(rec.match_score);
                        let rowBgColor = 'inherit';
                        if (matchScoreValue >= 90) {
                          rowBgColor = alpha(theme.palette.success.main, 0.1);
                        } else if (matchScoreValue >= 70) {
                          rowBgColor = alpha(theme.palette.info.main, 0.07);
                        } else if (matchScoreValue >= 50) {
                          rowBgColor = alpha(theme.palette.warning.main, 0.07);
                        }
                        
                        return (
                          <TableRow
                            key={index}
                            sx={{
                              bgcolor: rowBgColor,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                              }
                            }}
                          >
                            <TableCell>
                              {index === 0 ? (
                                <Chip
                                  size="small"
                                  label={`#${index + 1}`}
                                  color="success"
                                  sx={{ fontWeight: 'bold' }}
                                />
                              ) : (
                                `#${index + 1}`
                              )}
                            </TableCell>
                            <TableCell>{rec.employee_name}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 45,
                                    height: 45,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `conic-gradient(${theme.palette.success.main} ${formatMatchScore(rec.match_score)}%, ${alpha(theme.palette.success.main, 0.2)} 0%)`,
                                    mr: 1
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 35,
                                      height: 35,
                                      borderRadius: '50%',
                                      bgcolor: theme.palette.background.paper,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Typography variant="caption" fontWeight="bold">
                                      {formatMatchScore(rec.match_score)}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{rec.available_hours}</TableCell>
                            <TableCell>
                              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={rec.skill_name}
                                  onChange={(e) => {
                                    // Update the recommendation's skill name when changed
                                    const updatedRecs = recommendations.map((r, i) =>
                                      i === index ? { ...r, skill_name: e.target.value } : r
                                    );
                                    setRecommendations(updatedRecs);
                                  }}
                                  displayEmpty
                                  inputProps={{ 'aria-label': 'Select skill' }}
                                >
                                  {requiredSkills.map((skill) => (
                                    <MenuItem 
                                      key={skill} 
                                      value={skill}
                                      disabled={skillAllocationStatus[skill]?.isFull}
                                    >
                                      {skill} {skillAllocationStatus[skill]?.isFull ? '(Full)' : ''}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>{rec.explanation}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={rec.recommended_allocation}
                                  inputProps={{ 
                                    min: 10, 
                                    max: 100, 
                                    step: 10 
                                  }}
                                  onChange={(e) => {
                                    const newValue = Math.min(Math.max(parseInt(e.target.value) || 10, 10), 100);
                                    const updatedRecs = recommendations.map((r, i) =>
                                      i === index ? { ...r, recommended_allocation: newValue } : r
                                    );
                                    setRecommendations(updatedRecs);
                                  }}
                                  sx={{ width: 70, mr: 1 }}
                                />
                                <Typography variant="body2" sx={{ mx: 1 }}>%</Typography>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="primary"
                                  disabled={skillAllocationStatus[rec.skill_name]?.isFull}
                                  onClick={() => handleAllocationChange(
                                    rec.employee_id,
                                    rec.employee_name,
                                    rec.skill_name,
                                    rec.recommended_allocation || 20,
                                    true
                                  )}
                                  sx={{ ml: 1 }}
                                >
                                  Allocate
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {error && (
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                }}
              >
                {renderErrorMessage(error)}
              </Alert>            )}
          </CardContent>
        </Card>
      </motion.div>
        {error && (
        <motion.div variants={itemVariants}>
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            {renderErrorMessage(error)}
          </Alert>
        </motion.div>
      )}
      
      {success && (
        <motion.div variants={itemVariants}>
          <Alert 
            severity="success" 
            variant="filled"
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            {success}
          </Alert>
        </motion.div>
      )}
        {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 4 }}>
            <CircularProgress 
              color="primary" 
              size={60}
              thickness={4}
              sx={{ 
                mb: 2,
                color: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }} 
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Loading matches...
            </Typography>
          </Box>
        </motion.div>
      )}{selectedProject && projectRequirements.length > 0 && (
        <motion.div variants={itemVariants}>          <Card sx={{ 
            mb: 4, 
            borderRadius: 2,
            background: `linear-gradient(to right bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 10px 15px -3px ${alpha(theme.palette.common.black, 0.1)}, 0 4px 6px -2px ${alpha(theme.palette.common.black, 0.05)}`,
            width: '100%'
          }}><CardHeader 
              title={
                <Typography variant="h6" fontWeight={600}>
                  Project Requirements
                </Typography>
              }
              sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: alpha(theme.palette.primary.main, 0.05)
              }}
            />            <CardContent>              <TableContainer component={Paper} 
                sx={{ 
                  boxShadow: 'none',
                  backgroundColor: 'background.paper',
                  backgroundImage: 'none',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTableCell-root': { borderColor: alpha(theme.palette.divider, 0.1) },
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
                  }
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Skill</TableCell>
                      <TableCell>Employees Required</TableCell>
                      <TableCell>Currently Allocated</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectRequirements.map((req) => {
                      // Count how many employees are allocated for this skill
                      const allocatedCount = Object.entries(skillMatches)
                        .filter(([skill]) => skill === req.skill_name)
                        .reduce((count, [_, employees]) => {
                          return count + employees.filter(emp => emp.allocated).length;
                        }, 0);
                      
                      return (
                        <TableRow key={req.skill_id} hover>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {req.skill_name}
                            </Typography>
                          </TableCell>
                          <TableCell>{req.employees_requested}</TableCell>
                          <TableCell>{allocatedCount}</TableCell>
                          <TableCell>                            {allocatedCount >= req.employees_requested ? (
                              <Chip 
                                label="Fully Allocated" 
                                size="small"
                                icon={<CheckIcon />} 
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: alpha(theme.palette.success.main, 0.05),
                                  color: theme.palette.success.dark,
                                  borderRadius: 1.5,
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 8px ${alpha(theme.palette.success.main, 0.15)}`
                                  }
                                }}
                              />
                            ) : allocatedCount > 0 ? (
                              <Chip 
                                label="Partially Allocated" 
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                                  color: theme.palette.warning.dark,
                                  borderRadius: 1.5,
                                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 8px ${alpha(theme.palette.warning.main, 0.15)}`
                                  }
                                }}
                              />
                            ) : (
                              <Chip 
                                label="Not Allocated" 
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: alpha(theme.palette.error.main, 0.05),
                                  color: theme.palette.error.dark,
                                  borderRadius: 1.5,
                                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 8px ${alpha(theme.palette.error.main, 0.15)}`
                                  }
                                }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}        {!loading && selectedProject && Object.keys(skillMatches).length === 0 && (
        <motion.div variants={itemVariants}>
          <Alert 
            severity="info" 
            variant="filled"
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            No skill matches found for this project. Make sure to define skill requirements for the project.
          </Alert>
        </motion.div>
      )}
        {!loading && selectedProject && Object.keys(skillMatches).length > 0 && (
        <>
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 4 }}>              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Allocated Personnel by Required Skill
              </Typography>
              
              {Object.entries(skillMatches).map(([skill, employees]) => (
                <motion.div key={skill} variants={itemVariants}>                  <Card sx={{
                    mb: 3, 
                    overflow: 'visible',
                    borderRadius: 2,
                    background: `linear-gradient(to right bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: `0 10px 15px -3px ${alpha(theme.palette.common.black, 0.1)}, 0 4px 6px -2px ${alpha(theme.palette.common.black, 0.05)}`,
                    width: '100%'
                  }}>
                    <CardHeader 
                      title={<Typography variant="h6" fontWeight={600}>Skill: {skill}</Typography>}
                      sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        background: alpha(theme.palette.primary.main, 0.05),
                      }}
                    />                    <CardContent>
                      {employees.length === 0 ? (
                        <Typography>No employees with this skill found.</Typography>
                      ) : (
                        <TableContainer component={Paper} 
                          sx={{ 
                            boxShadow: 'none',
                            backgroundColor: 'background.paper',
                            backgroundImage: 'none',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            '& .MuiTableCell-root': { borderColor: alpha(theme.palette.divider, 0.1) },
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
                            }
                          }}
                        >
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Availability</TableCell>
                                <TableCell>Current Project</TableCell>
                                <TableCell>Allocation %</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {employees
                                .filter(employee => employee.allocated)
                                .map((employee) => (
                                  <TableRow 
                                    key={employee.id} 
                                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                                  >
                                    <TableCell>
                                      <Typography fontWeight="medium">{employee.name}</Typography>
                                    </TableCell>
                                    <TableCell>{employee.email}</TableCell>
                                    <TableCell>
                                      <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress 
                                          variant="determinate" 
                                          value={employee.availability} 
                                          color={employee.availability > 70 ? "success" : 
                                                employee.availability > 30 ? "warning" : "error"}
                                          sx={{ 
                                            height: 10, 
                                            borderRadius: 5,
                                            bgcolor: alpha(theme.palette.background.default, 0.5)
                                          }} 
                                        />
                                      </Box>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {employee.availability}%
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      {employee.current_project || 
                                        <Typography color="text.secondary" variant="body2">Not Assigned</Typography>
                                      }
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Chip 
                                          label="Already Allocated" 
                                          size="small" 
                                          color="info"
                                          sx={{ mr: 1 }} 
                                        />
                                        <Button
                                          variant="outlined"
                                          color="error"
                                          size="small"
                                          startIcon={<RemoveCircleIcon />}
                                          onClick={() => handleRemoveAllocation(employee.id, skill)}
                                          sx={{ ml: 1 }}
                                        >
                                          Remove
                                        </Button>
                                      </Box>
                                    </TableCell>                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        
            <motion.div variants={itemVariants} id="selected-allocations">            <Card sx={{ 
              mb: 4, 
              borderRadius: 2,
              background: `linear-gradient(to right bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 10px 15px -3px ${alpha(theme.palette.common.black, 0.1)}, 0 4px 6px -2px ${alpha(theme.palette.common.black, 0.05)}`,
              width: '100%'
            }}>
              <CardHeader 
                title={
                  <Typography variant="h6" fontWeight={600}>
                    Selected Allocations
                  </Typography>
                }
                sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: alpha(theme.palette.primary.main, 0.05)
                }}
              />
              <CardContent>
                {allocations.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                    No allocations selected yet.
                  </Typography>
                ) : (                  <TableContainer component={Paper} 
                    sx={{ 
                      boxShadow: 'none',
                      backgroundColor: 'background.paper',
                      backgroundImage: 'none',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      '& .MuiTableCell-root': { borderColor: alpha(theme.palette.divider, 0.1) },
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
                      }
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee ID</TableCell>
                          <TableCell>Employee Name</TableCell>
                          <TableCell>Skill</TableCell>
                          <TableCell>Allocation %</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allocations.map((allocation, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{allocation.employee_id}</TableCell>
                            <TableCell>
                              <Typography fontWeight="medium">
                                {allocation.employee_name}
                              </Typography>
                            </TableCell>
                            <TableCell>                              <Chip 
                                label={allocation.skill_name} 
                                size="small" 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  color: theme.palette.primary.dark,
                                  borderRadius: 1.5,
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                  fontWeight: 500,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.15)}`
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>                              <Chip
                                label={`${allocation.allocation_percentage}%`}
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                                  color: theme.palette.secondary.dark,
                                  borderRadius: 1.5,
                                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                                  fontWeight: 500,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 8px ${alpha(theme.palette.secondary.main, 0.15)}`
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<RemoveCircleIcon />}
                                onClick={() => {
                                  const newAllocations = allocations.filter((_, i) => i !== index);
                                  setAllocations(newAllocations);
                                }}
                                sx={{
                                  borderRadius: 1.5,
                                  borderWidth: 1.5,
                                  fontSize: '0.75rem',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    borderWidth: 1.5,
                                    background: alpha(theme.palette.error.main, 0.05),
                                    transform: 'translateY(-2px)',
                                  }
                                }}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
              <CardActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAllocate}
                  disabled={allocations.length === 0}
                  sx={{ 
                    py: 1, 
                    px: 3,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.6)}`,
                    }
                  }}
                >
                  Confirm Allocations
                </Button>
              </CardActions>
            </Card>
          </motion.div>
        </>
      )}      {/* We've removed the duplicate recommendations panel */}
    </Box>
  );
};

export default EmployeeMatching;
