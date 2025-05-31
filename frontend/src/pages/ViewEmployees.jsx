import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  IconButton, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Tooltip,
  Avatar,
  alpha,
  useTheme
} from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Work as WorkIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const ViewEmployees = () => {
  const theme = useTheme();
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched employees:", data); // Debugging log
          setEmployees(data);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || "Failed to fetch employees");
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("An error occurred. Please try again.");
      }
    };

    fetchEmployees();
  }, []);

  const deleteEmployee = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this employee?")) {
        const response = await fetch(`http://localhost:8000/api/auth/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          setEmployees(employees.filter((employee) => employee.id !== id));
          setSuccess("Employee deleted successfully!");
          setTimeout(() => setSuccess(""), 3000); // Clear success message after 3 seconds
        } else {
          const errorData = await response.json();
          setError(errorData.detail || "Failed to delete employee");
        }
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError("An error occurred. Please try again.");
    }
  };

  // Get color based on role
  const getRoleColor = (role) => {
    switch (role) {
      case "project_manager": return theme.palette.primary.main;
      case "employee": return theme.palette.info.main;
      default: return theme.palette.secondary.main;
    }
  };

  // Get initials from full name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Employees
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/register-employee")}
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              background: theme.palette.gradients.primary,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: theme.shadows[6],
              }
            }}
          >
            Register Employee
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
      
      {employees.length === 0 && !error ? (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}
        >
          No employees found.
        </Alert>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[3],
              overflow: 'hidden'
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow 
                    key={employee.id}
                    component={motion.tr}
                    variants={itemVariants}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(getRoleColor(employee.role), 0.8),
                            color: '#fff',
                            fontWeight: 'bold',
                            mr: 1.5
                          }}
                        >
                          {getInitials(employee.full_name)}
                        </Avatar>
                        <Typography variant="body1" fontWeight={500}>
                          {employee.full_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      {employee.department ? (
                        <Chip 
                          icon={<WorkIcon fontSize="small" />} 
                          label={employee.department}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.dark,
                            borderRadius: 1
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={employee.role === "project_manager" ? "Project Manager" : "Employee"} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(getRoleColor(employee.role), 0.1),
                          color: getRoleColor(employee.role),
                          fontWeight: 500,
                          borderRadius: 1
                        }}
                      />
                    </TableCell>
                    <TableCell>{employee.position || "-"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                        {employee.skills && employee.skills.length > 0 ? (
                          employee.skills.slice(0, 2).map((skill, index) => (
                            <Chip
                              key={index}
                              label={typeof skill === 'object' ? skill.name : skill}
                              size="small"
                              color="default"
                              variant="outlined"
                              sx={{ mb: 0.5 }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No skills specified
                          </Typography>
                        )}
                        {employee.skills && employee.skills.length > 2 && (
                          <Chip
                            label={`+${employee.skills.length - 2}`}
                            size="small"
                            color="default"
                            sx={{ mb: 0.5 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary"
                            onClick={() => navigate(`/employees/${employee.id}`)}
                            size="small"
                            sx={{ 
                              mr: 1,
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error" 
                            onClick={() => deleteEmployee(employee.id)}
                            size="small"
                            sx={{ 
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      )}
    </Box>
  );
};

export default ViewEmployees;