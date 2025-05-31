import React, { useState, useEffect, useContext } from "react";
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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  FormHelperText,
  Divider,
  Alert,
  CircularProgress,
  Container,
  Paper,
  alpha,
  useTheme,
  IconButton,
  Avatar,
  ListItemText,
  Checkbox
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon
} from "@mui/icons-material";

const EmployeeProfile = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [employeeData, setEmployeeData] = useState(null);
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [updateError, setUpdateError] = useState(null);

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

  // Get gradient styles from theme
  const gradientStyles = {
    primary: theme.palette.gradients?.primary || 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
    success: theme.palette.gradients?.success || 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
    info: theme.palette.gradients?.info || 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)',
    warning: theme.palette.gradients?.warning || 'linear-gradient(45deg, #D97706 30%, #F59E0B 90%)',
    secondary: theme.palette.gradients?.secondary || 'linear-gradient(45deg, #DB2777 30%, #EC4899 90%)',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch employee data
        const employeeResponse = await fetch(`http://localhost:8000/api/auth/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        // Fetch all skills
        const skillsResponse = await fetch(`http://localhost:8000/api/skills`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (employeeResponse.ok && skillsResponse.ok) {
          const empData = await employeeResponse.json();
          const skills = await skillsResponse.json();
          
          setEmployeeData(empData);
          setFullName(empData.full_name || "");
          setDepartment(empData.department || "");
          setPosition(empData.position || "");
          
          // Handle skills with proper error checking
          if (empData.skills && Array.isArray(empData.skills)) {
            setSelectedSkills(empData.skills.map(skill => 
              typeof skill === 'object' && skill.name ? skill.name : 
              typeof skill === 'string' ? skill : ''
            ).filter(Boolean));
          } else {
            setSelectedSkills([]);
          }
          
          setAvailableSkills(Array.isArray(skills) ? skills : []);
        } else {
          if (!employeeResponse.ok) {
            console.error("Failed to fetch employee data:", await employeeResponse.text());
          }
          if (!skillsResponse.ok) {
            console.error("Failed to fetch skills:", await skillsResponse.text());
          }
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load your profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    try {
      // Create a clean update object without undefined values
      const updateData = {
        full_name: fullName || undefined,
        department: department || undefined,
        position: position || undefined,
        // Only include skills if they're valid
        skills: Array.isArray(selectedSkills) && selectedSkills.length > 0 
          ? selectedSkills.filter(s => typeof s === 'string' && s.trim() !== '') 
          : undefined
      };
      
      // Clean the object by removing undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );
      
      console.log("Sending update with data:", updateData);
      
      // Use the /me endpoint
      const response = await fetch(`http://localhost:8000/api/auth/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        
        // Update our local state with the response data
        setEmployeeData(updatedUser);
        setFullName(updatedUser.full_name || "");
        setDepartment(updatedUser.department || "");
        setPosition(updatedUser.position || "");
        
        if (updatedUser.skills && Array.isArray(updatedUser.skills)) {
          setSelectedSkills(updatedUser.skills.map(skill => 
            typeof skill === 'object' && skill.name ? skill.name : 
            typeof skill === 'string' ? skill : ''
          ).filter(Boolean));
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        // Handle specific error codes
        if (response.status === 422) {
          const errorData = await response.json();
          // Convert validation error to string instead of displaying as object
          if (Array.isArray(errorData.detail)) {
            setUpdateError(errorData.detail.map(err => 
              `${err.loc.join('.')}: ${err.msg}`
            ).join(', '));
          } else if (typeof errorData.detail === 'object') {
            setUpdateError(JSON.stringify(errorData.detail));
          } else {
            setUpdateError(errorData.detail || "Validation error in your input");
          }
        } else {
          const errorText = await response.text();
          setUpdateError(errorText || "Failed to update profile");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError("An error occurred while updating your profile: " + (error.message || "Unknown error"));
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
            Loading your profile...
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
            My Profile
          </Typography>
        </motion.div>
      </Box>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card 
          elevation={3} 
          component={motion.div}
          variants={itemVariants}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="div" fontWeight={600}>
                  Profile Information
                </Typography>
              </Box>
            }
            action={
              !isEditing && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Edit Profile
                </Button>
              )
            }
            sx={{ 
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: alpha(theme.palette.primary.main, 0.05),
              '& .MuiCardHeader-content': {
                flex: '1 1 auto',
                textAlign: 'center'
              },
              '& .MuiCardHeader-action': {
                margin: 0,
                alignSelf: 'center',
              }
            }}
          />
          
          <CardContent sx={{ p: 3 }}>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Alert 
                  severity="success" 
                  variant="filled"
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    backgroundImage: gradientStyles.success,
                    textAlign: 'center'
                  }}
                >
                  {success}
                </Alert>
              </motion.div>
            )}
            
            {updateError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert 
                  severity="error" 
                  variant="filled"
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    textAlign: 'center'
                  }}
                >
                  {updateError}
                </Alert>
              </motion.div>
            )}
            
            {isEditing ? (
              <motion.form 
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={3} justifyContent="center">
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      variant="outlined"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'primary.light' }} />,
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Department"
                      variant="outlined"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: 'primary.light' }} />,
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Position"
                      variant="outlined"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: <WorkIcon sx={{ mr: 1, color: 'primary.light' }} />,
                      }}
                    />
                  
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="skills-label">Skills</InputLabel>
                      <Select
                        labelId="skills-label"
                        multiple
                        value={selectedSkills || []}
                        onChange={(e) => {
                          setSelectedSkills(e.target.value);
                        }}
                        input={<OutlinedInput label="Skills" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                            {selected.map((value) => (
                              <Chip 
                                key={value} 
                                label={value} 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.light,
                                  fontWeight: 500,
                                  borderRadius: 1.5,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.info.main, 0.2),
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        sx={{ minHeight: '56px' }}
                      >
                        {availableSkills.map((skill) => (
                          <MenuItem
                            key={typeof skill === 'object' ? skill.id : skill}
                            value={typeof skill === 'object' ? skill.name : skill}
                          >
                            <Checkbox 
                              checked={selectedSkills.indexOf(typeof skill === 'object' ? skill.name : skill) > -1} 
                              sx={{ 
                                color: theme.palette.info.main,
                                '&.Mui-checked': {
                                  color: theme.palette.info.main,
                                },
                              }}
                            />
                            <ListItemText primary={typeof skill === 'object' ? skill.name : skill} />
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText sx={{ textAlign: 'center' }}>Select multiple skills that match your expertise</FormHelperText>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        sx={{ 
                          py: 1.2,
                          px: 3,
                          backgroundImage: gradientStyles.primary,
                          borderRadius: 2,
                          boxShadow: theme.shadows[4],
                          '&:hover': {
                            boxShadow: theme.shadows[8],
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                      
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setIsEditing(false);
                          setUpdateError(null);
                          // Reset form values
                          setFullName(employeeData.full_name || "");
                          setDepartment(employeeData.department || "");
                          setPosition(employeeData.position || "");
                          if (employeeData.skills && Array.isArray(employeeData.skills)) {
                            setSelectedSkills(employeeData.skills.map(skill => 
                              typeof skill === 'object' && skill.name ? skill.name : 
                              typeof skill === 'string' ? skill : ''
                            ).filter(Boolean));
                          } else {
                            setSelectedSkills([]);
                          }
                        }}
                        sx={{ 
                          py: 1.2,
                          px: 3,
                          borderRadius: 2,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} md={10}>
                    <Paper
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        background: alpha(theme.palette.background.default, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                        <Avatar 
                          sx={{ 
                            width: 80, 
                            height: 80,
                            background: gradientStyles.primary,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '2rem',
                            mb: 2,
                            boxShadow: theme.shadows[4],
                          }}
                        >
                          {employeeData.full_name?.charAt(0) || user?.username?.charAt(0) || "U"}
                        </Avatar>
                        <Typography variant="h4" fontWeight={600} gutterBottom>
                          {employeeData.full_name || "Not specified"}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {employeeData.role === "employee" ? "Employee" : "Project Manager"}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <EmailIcon sx={{ mb: 1, color: 'primary.light', fontSize: 32 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                              Email
                            </Typography>
                            <Typography variant="body1" fontWeight={500} align="center">
                              {employeeData.email || "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <BusinessIcon sx={{ mb: 1, color: 'success.light', fontSize: 32 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                              Department
                            </Typography>
                            <Typography variant="body1" fontWeight={500} align="center">
                              {employeeData.department || "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <WorkIcon sx={{ mb: 1, color: 'info.light', fontSize: 32 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                              Position
                            </Typography>
                            <Typography variant="body1" fontWeight={500} align="center">
                              {employeeData.position || "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={10}>
                    <Paper
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        background: alpha(theme.palette.background.default, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                          <Box mb={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <StarIcon sx={{ mb: 1, color: 'warning.main', fontSize: 32 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                              Performance Score
                            </Typography>
                            <Typography variant="h5" fontWeight={600} color={employeeData.average_performance >= 4 ? 'success.main' : 'info.main'} align="center">
                              {employeeData.average_performance || "0"}/5
                            </Typography>
                            
                            <Box sx={{ width: '100%', mt: 1 }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                              >
                                <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 4 }}>
                                  <Box
                                    sx={{
                                      height: '100%',
                                      width: `${(employeeData.average_performance / 5) * 100 || 0}%`,
                                      borderRadius: 4,
                                      backgroundImage: 
                                        employeeData.average_performance >= 4 ? gradientStyles.success :
                                        employeeData.average_performance >= 3 ? gradientStyles.info :
                                        gradientStyles.warning,
                                    }}
                                  />
                                </Box>
                              </motion.div>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box mb={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ mb: 1, color: 'secondary.main', fontSize: 32 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                              Availability
                            </Typography>
                            <Typography variant="h5" fontWeight={600} color="info.main" align="center">
                              {employeeData.availability_percentage || "100"}%
                            </Typography>
                            
                            <Box sx={{ width: '100%', mt: 1 }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                              >
                                <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 4 }}>
                                  <Box
                                    sx={{
                                      height: '100%',
                                      width: `${employeeData.availability_percentage || 100}%`,
                                      borderRadius: 4,
                                      backgroundImage: gradientStyles.info,
                                    }}
                                  />
                                </Box>
                              </motion.div>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 3 }} />
                      
                      <Typography variant="subtitle1" fontWeight={600} mb={2} align="center">
                        Skills
                      </Typography>
                      
                      {employeeData.skills && Array.isArray(employeeData.skills) && employeeData.skills.length > 0 ? (
                        <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                          {employeeData.skills.map((skill, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * index, duration: 0.3 }}
                            >
                              <Chip
                                label={typeof skill === 'object' ? skill.name : skill}
                                sx={{
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.light,
                                  fontWeight: 500,
                                  borderRadius: 1.5,
                                  p: 0.2,
                                  height: 28,
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.info.main, 0.2),
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              />
                            </motion.div>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="center">
                          No skills added yet
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default EmployeeProfile;
