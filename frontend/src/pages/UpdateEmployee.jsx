import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardHeader,
  CardContent, 
  TextField, 
  Button, 
  MenuItem, 
  InputLabel,
  FormControl,
  Select,
  FormHelperText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  OutlinedInput,
  Chip,
  useTheme,
  alpha,
  Paper
} from "@mui/material";
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
  BarChart as BarChartIcon,
  Code as CodeIcon,
  Star as StarIcon,
  AdminPanelSettings as AdminIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import PerformanceIndicator from "../components/PerformanceIndicator";

const UpdateEmployee = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    department: "",
    position: "",
    availability_percentage: 100,
    average_performance: 0,
    skills: []
  });
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee data
        const empResponse = await fetch(`http://localhost:8000/api/auth/users/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Fetch all skills for dropdown
        const skillsResponse = await fetch("http://localhost:8000/api/skills", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (empResponse.ok && skillsResponse.ok) {
          const empData = await empResponse.json();
          const skills = await skillsResponse.json();
          console.log("Employee data:", empData);
          console.log("Employee skills:", empData.skills);
          
          // Process employee skills data
          let employeeSkills = [];
          if (Array.isArray(empData.skills)) {
            employeeSkills = empData.skills.map(skill => {
              // Extract skill name from the skill object
              if (typeof skill === 'object' && skill !== null) {
                return skill.name || "";
              } else if (typeof skill === 'string') {
                return skill;
              }
              return "";
            }).filter(skill => skill !== "");
          }
          
          console.log("Processed employee skills:", employeeSkills);
          
          setEmployee(empData);
          setFormData({
            full_name: empData.full_name || "",
            email: empData.email || "",
            role: empData.role || "employee",
            department: empData.department || "",
            position: empData.position || "",
            availability_percentage: empData.availability_percentage !== undefined ? empData.availability_percentage : 100,
            average_performance: empData.average_performance !== undefined ? empData.average_performance : 0,
            skills: employeeSkills
          });
          setAllSkills(skills);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSkillChange = (e) => {
    const selectedOptions = e.target.value;
    console.log("Selected skills:", selectedOptions);
    setFormData(prev => ({
      ...prev,
      skills: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/auth/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Employee updated successfully!");
        // Navigate back to employees list after short delay
        setTimeout(() => {
          navigate("/employees");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to update employee");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      setError("An error occurred while updating employee");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh', 
          flexDirection: 'column' 
        }}
      >
        <CircularProgress color="primary" size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: theme.palette.text.secondary }}>
          Loading employee data...
        </Typography>
      </Box>
    );
  }

  if (error && !employee) {
    return (
      <Box sx={{ mt: 5 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/employees")}
          sx={{
            borderRadius: 2,
            background: theme.palette.gradients.primary,
          }}
        >
          Back to Employees
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 5 }}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Update Employee
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/employees")}
            sx={{
              borderRadius: 2,
              borderWidth: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Back to Employees
          </Button>
        </Box>
      </motion.div>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}
        >
          {success}
        </Alert>
      )}

      <Card 
        component="form"
        onSubmit={handleSubmit}
        sx={{
          borderRadius: 3,
          boxShadow: theme.shadows[8],
          overflow: 'visible',
        }}
        elevation={3}
      >
        <CardHeader 
          title="Employee Information" 
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: alpha(theme.palette.secondary.dark, 0.05),
            '& .MuiCardHeader-title': {
              fontSize: '1.2rem',
              fontWeight: 600,
            }
          }}
        />
        <CardContent sx={{ pt: 3, pb: 2 }}>
          <Grid 
            container 
            spacing={3}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <TextField
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <PersonIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <EmailIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                  startAdornment={
                    <AdminIcon color="action" sx={{ mr: 1 }} />
                  }
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="project_manager">Project Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <TextField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <WorkIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <TextField
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <BadgeIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <TextField
                label="Availability (%)"
                name="availability_percentage"
                type="number"
                value={formData.availability_percentage}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  inputProps: { min: 0, max: 100 },
                  startAdornment: (
                    <BarChartIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <Box sx={{ 
                p: 2, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                height: '100%'
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                  Performance Rating
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <PerformanceIndicator value={Number(formData.average_performance) || 0} size="medium" />
                  
                  <TextField
                    name="average_performance"
                    type="number"
                    value={formData.average_performance}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                    helperText="Rate from 0-5 (supports decimals)"
                    InputProps={{
                      inputProps: { min: 0, max: 5, step: 0.1 },
                      startAdornment: (
                        <StarIcon color="warning" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Current Skills
                </Typography>                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    backgroundColor: alpha(theme.palette.background.default, 0.7),
                    minHeight: '60px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  {formData.skills && formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <Chip 
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 500,
                          border: `2px solid ${theme.palette.primary.main}`,
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[2]
                          }
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No skills assigned yet
                    </Typography>
                  )}
                </Paper>
              </Box>
              
              <FormControl fullWidth variant="outlined">
                <InputLabel id="skills-label">Skills</InputLabel>                <Select
                  labelId="skills-label"
                  id="skills"
                  name="skills"
                  multiple
                  value={formData.skills || []}
                  onChange={handleSkillChange}
                  input={<OutlinedInput label="Skills" />}
                  startAdornment={
                    <CodeIcon color="action" sx={{ mr: 1 }} />
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={value} 
                          size="small"
                          sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.dark
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {allSkills && Array.isArray(allSkills) && allSkills.map((skill) => (
                    <MenuItem key={skill.id || skill.name} value={skill.name}>
                      {skill.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Hold Ctrl/Cmd to select multiple skills</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ mr: 1.5, borderRadius: 2, px: 3 }}
            onClick={() => navigate("/employees")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            startIcon={<SaveIcon />}
            disabled={submitting}
            sx={{
              borderRadius: 2,
              px: 3,
              background: theme.palette.gradients.secondary,
            }}
          >
            {submitting ? "Updating..." : "Update Employee"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default UpdateEmployee;