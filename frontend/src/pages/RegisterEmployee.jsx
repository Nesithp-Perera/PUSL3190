import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  InputAdornment,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  OutlinedInput,
  Chip,
  useTheme,
  alpha
} from "@mui/material";
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
  Code as CodeIcon,
  AdminPanelSettings as AdminIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const RegisterEmployee = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
    position: "",
    skills: []
  });
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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
    const fetchSkills = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/skills", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const skills = await response.json();
          setAllSkills(skills);
        } else {
          console.error("Failed to fetch skills");
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillChange = (e) => {
    const selectedOptions = e.target.value;
    setFormData(prev => ({
      ...prev,
      skills: selectedOptions
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      // First register the user
      const registerResponse = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      if (registerResponse.ok) {
        // Get the user id of the newly created user
        const usersResponse = await fetch("http://localhost:8000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          const newUser = users.find(u => u.email === formData.email);
          
          if (newUser) {
            // Update additional fields
            const updateResponse = await fetch(`http://localhost:8000/api/auth/users/${newUser.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                department: formData.department,
                position: formData.position,
                skills: formData.skills
              }),
            });
            
            if (updateResponse.ok) {
              setSuccess("Employee registered successfully!");
              // Navigate back to employees list after short delay
              setTimeout(() => {
                navigate("/employees");
              }, 2000);
            } else {
              setError("Employee created but failed to update additional details.");
            }
          } else {
            setSuccess("Employee registered successfully!");
          }
        } else {
          setSuccess("Employee registered successfully!");
        }
      } else {
        const errorData = await registerResponse.json();
        setError(errorData.detail || "Failed to register employee");
      }
    } catch (error) {
      console.error("Error registering employee:", error);
      setError("An error occurred while registering employee");
    } finally {
      setLoading(false);
    }
  };

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
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Register New Employee
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
            background: alpha(theme.palette.primary.dark, 0.05),
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
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <LockIcon color="action" sx={{ mr: 1 }} />
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
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
            
            <Grid item xs={12} component={motion.div} variants={itemVariants}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="skills-label">Skills</InputLabel>
                <Select
                  labelId="skills-label"
                  id="skills"
                  name="skills"
                  multiple
                  value={formData.skills}
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
                  {allSkills.map((skill) => (
                    <MenuItem key={skill.id} value={skill.name}>
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
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              background: theme.palette.gradients.primary,
            }}
          >
            {loading ? "Registering..." : "Register Employee"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default RegisterEmployee;