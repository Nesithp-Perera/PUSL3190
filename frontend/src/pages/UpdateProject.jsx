import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Divider,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  alpha
} from "@mui/material";
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Update as UpdateIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const UpdateProject = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState(3);
  const [status, setStatus] = useState("planning");
  const [skillRequirements, setSkillRequirements] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  // Fetch the project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setName(data.name);
          setDescription(data.description);
          setStartDate(data.start_date);
          setEndDate(data.end_date);
          setPriority(data.priority);
          setStatus(data.status);
          
          // Transform skill requirements to match the form structure
          if (data.skill_requirements) {
            setSkillRequirements(
              data.skill_requirements.map(req => ({
                skill_id: req.skill_id,
                employees_requested: req.employees_requested
              }))
            );
          }
        } else {
          console.error("Failed to fetch project details");
          setError("Failed to load project details");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("An error occurred while loading the project data");
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch available skills
    const fetchSkills = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/skills", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAvailableSkills(data);
        } else {
          console.error("Failed to fetch skills");
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };

    fetchProject();
    fetchSkills();
  }, [id]);

  const handleAddSkillRequirement = () => {
    setSkillRequirements([
      ...skillRequirements,
      { skill_id: "", employees_requested: 1 },
    ]);
  };

  const handleSkillChange = (index, field, value) => {
    const updatedRequirements = [...skillRequirements];
    updatedRequirements[index][field] = value;
    setSkillRequirements(updatedRequirements);
  };

  const handleRemoveSkillRequirement = (index) => {
    const updatedRequirements = [...skillRequirements];
    updatedRequirements.splice(index, 1);
    setSkillRequirements(updatedRequirements);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user")); // Get the user object from localStorage
      if (!user || !user.id) {
        setError("User information is missing. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          priority,
          status,
          manager_id: user.id, // Keep the existing manager
          skill_requirements: skillRequirements.map((req) => ({
            skill_id: req.skill_id,
            employees_requested: req.employees_requested,
          })),
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/view-projects"), 2000); // Redirect after success
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to update project");
      }
    } catch (err) {
      console.error("Error updating project:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
          Loading project data...
        </Typography>
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
            Update Project
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/view-projects")}
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
            Back to Projects
          </Button>
        </Box>
      </motion.div>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}
        >
          {typeof error === "string"
            ? error
            : Array.isArray(error)
            ? error.map((err, index) => <span key={index}>{err.msg}<br /></span>)
            : "An unexpected error occurred"}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}
        >
          Project updated successfully! Redirecting...
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
          title="Project Information" 
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
            <Grid item xs={12} component={motion.div} variants={itemVariants}>
              <TextField
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} component={motion.div} variants={itemVariants}>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                fullWidth
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(Number(e.target.value))}
                >
                  <MenuItem value={1}>1 (Highest)</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3 (Medium)</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5 (Lowest)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="on-hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Skill Requirements</Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddSkillRequirement}
                size="small"
              >
                Add Skill
              </Button>
            </Box>
            
            {skillRequirements.length === 0 && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                No skill requirements added yet. Click "Add Skill" to add requirements.
              </Alert>
            )}
            
            {skillRequirements.map((req, index) => (
              <Paper
                key={index}
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  border: `1px solid ${alpha(theme.palette.secondary.light, 0.1)}`,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`skill-label-${index}`}>Skill</InputLabel>
                      <Select
                        labelId={`skill-label-${index}`}
                        value={req.skill_id}
                        label="Skill"
                        onChange={(e) => handleSkillChange(index, "skill_id", e.target.value)}
                        required
                      >
                        <MenuItem value="">Select Skill</MenuItem>
                        {availableSkills.map((skill) => (
                          <MenuItem key={skill.id} value={skill.id}>
                            {skill.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Employees Needed"
                      type="number"
                      value={req.employees_requested}
                      onChange={(e) =>
                        handleSkillChange(index, "employees_requested", Number(e.target.value))
                      }
                      required
                      fullWidth
                      InputProps={{ inputProps: { min: 1 } }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveSkillRequirement(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        </CardContent>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ mr: 1.5, borderRadius: 2, px: 3 }}
            onClick={() => navigate("/view-projects")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            startIcon={<UpdateIcon />}
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              px: 3,
              background: theme.palette.gradients.secondary,
            }}
          >
            {isSubmitting ? "Updating..." : "Update Project"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default UpdateProject;