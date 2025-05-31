import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
  Avatar,
  CircularProgress,
  LinearProgress,
  Tooltip,
  IconButton,
  InputAdornment,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Zoom,
  Snackbar,
  Menu,
  MenuItem,
  Badge,
  Pagination,
  alpha,
  useTheme,
  Container
} from "@mui/material";
import { 
  PersonAdd as PersonAddIcon, 
  Edit as EditIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ManageAccounts as ManageAccountsIcon,
  Star as StarIcon,
  Email as EmailIcon
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const Employees = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [isDeleting, setIsDeleting] = useState(false);

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
  
  const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 50,
        damping: 15
      }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { 
        duration: 0.3 
      }
    }
  };
  
  const pulseAnimation = {
    pulse: {
      scale: [1, 1.02, 1],
      opacity: [0.9, 1, 0.9],
      transition: { duration: 2, repeat: Infinity }
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

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
          setFilteredEmployees(data);
        } else {
          setError("Failed to fetch employees. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("An error occurred while fetching employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);
  
  // Apply search and filters
  useEffect(() => {
    let result = [...employees];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        emp => emp.full_name?.toLowerCase().includes(query) || 
               emp.email?.toLowerCase().includes(query) ||
               emp.department?.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(emp => emp.role === roleFilter);
    }
    
    setFilteredEmployees(result);
    // Reset to first page when filters change
    setPage(1);
  }, [searchQuery, roleFilter, employees]);
  
  // Handle employee deletion
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:8000/api/auth/users/${employeeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      
      if (response.ok) {
        // Remove from local state
        setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
        
        // Show success message
        setSnackbar({
          open: true, 
          message: `${employeeToDelete.full_name} has been successfully deleted.`, 
          severity: 'success'
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.detail || 'Failed to delete employee.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting the employee.',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
      setEmployeeToDelete(null);
    }
  };
  
  // Handle menu opening
  const handleMenuOpen = (event, employee) => {
    setSelectedEmployee(employee);
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handle menu closing
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedEmployee(null);
  };
  
  // Calculate pagination
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Get color based on role
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return theme.palette.error.main;
      case 'manager': return theme.palette.warning.main;
      case 'user': return theme.palette.primary.main;
      default: return theme.palette.info.main;
    }
  };

  // Format role name for display
  const formatRoleName = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'user': return 'Employee';
      default: return role;
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
            Loading employees...
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
            Employee Management
          </Typography>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/register-employee")}
            sx={{ 
              py: 1.25, 
              px: 3,
              backgroundImage: gradientStyles.primary,
              boxShadow: `0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.6)}`,
              }
            }}
          >
            Register New Employee
          </Button>
        </motion.div>
      </Box>
      
      {/* Search and filters section */}
      <Box sx={{ 
        mb: 4,
        display: 'flex', 
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        p: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 4px 20px 0 ${alpha(theme.palette.common.black, 0.05)}`
      }}>
        <Box sx={{ flex: 1, minWidth: '280px' }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            py: 1, 
            px: 2, 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}>
            <FilterListIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={500} color="text.secondary">Filter:</Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="All"
                size="small"
                onClick={() => setRoleFilter('all')}
                color={roleFilter === 'all' ? 'primary' : 'default'}
                variant={roleFilter === 'all' ? 'filled' : 'outlined'}
                sx={{ 
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              />
              <Chip
                label="Managers"
                size="small"
                onClick={() => setRoleFilter('project_manager')}
                color={roleFilter === 'project_manager' ? 'primary' : 'default'}
                variant={roleFilter === 'project_manager' ? 'filled' : 'outlined'}
                sx={{ 
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              />
              <Chip
                label="Employees"
                size="small"
                onClick={() => setRoleFilter('employee')}
                color={roleFilter === 'employee' ? 'primary' : 'default'}
                variant={roleFilter === 'employee' ? 'filled' : 'outlined'}
                sx={{ 
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Box>
          
          <Box>
            <Badge 
              badgeContent={filteredEmployees.length} 
              color="primary"
              showZero
              sx={{
                '& .MuiBadge-badge': {
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }
              }}
            >
              <Chip
                icon={<PersonIcon />}
                label="Total Employees"
                variant="outlined"
                size="medium"
                sx={{ 
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              />
            </Badge>
          </Box>
        </Box>
      </Box>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="employeeCard"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
          >            <Card 
              elevation={3}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[8],
                },
                position: 'relative'
              }}
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Card header */}              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: theme.palette.primary.light }} />
                      <Typography variant="h6" fontWeight={600}>
                        Employee Directory
                      </Typography>
                    </Box>
                    
                    {filteredEmployees.length > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Showing <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>{paginatedEmployees.length}</Box> of{' '}
                        <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>{filteredEmployees.length}</Box> employees
                      </Typography>
                    )}
                  </Box>
                }
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                sx={{ 
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: alpha(theme.palette.primary.main, 0.05),
                  '& .MuiCardHeader-title': {
                    color: theme.palette.primary.light,
                    textAlign: 'center'
                  },
                  p: 2
                }}
              />
              
              <CardContent sx={{ p: 2 }}>
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    background: 'transparent', 
                    boxShadow: 'none',
                    maxHeight: '65vh',
                    overflowY: 'auto', 
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: alpha(theme.palette.background.paper, 0.05),
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: alpha(theme.palette.primary.main, 0.2),
                      borderRadius: '4px',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.3),
                      }
                    }
                  }}
                >
                  <Table>
                    <TableHead sx={{ 
                      position: 'sticky',
                      top: 0, 
                      zIndex: 10, 
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: 'blur(10px)'
                    }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Availability</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {paginatedEmployees.map((employee) => (
                          <TableRow 
                            key={employee.id}
                            component={motion.tr}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, x: -20 }}
                            sx={{ 
                              position: 'relative',
                              transition: 'all 0.3s',
                              '&:after': {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: '1rem',
                                right: '1rem',
                                height: '1px',
                                bgcolor: alpha(theme.palette.divider, 0.05)
                              },
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                transform: 'translateX(6px)',
                              }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 42,
                                    height: 42,
                                    bgcolor: alpha(getRoleColor(employee.role), 0.8),
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    mr: 1.5,
                                    boxShadow: `0 4px 12px ${alpha(getRoleColor(employee.role), 0.3)}`,
                                    border: `2px solid ${alpha('#fff', 0.8)}`,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  {getInitials(employee.full_name)}
                                </Avatar>
                                <Box>
                                  <Typography 
                                    variant="body1" 
                                    fontWeight={600}
                                    sx={{
                                      color: theme.palette.text.primary
                                    }}
                                  >
                                    {employee.full_name}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ display: 'block' }}
                                  >
                                    ID: {employee.id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon 
                                  fontSize="small" 
                                  sx={{ mr: 1, color: alpha(theme.palette.text.secondary, 0.7) }}
                                />
                                <Typography variant="body2">{employee.email}</Typography>
                              </Box>
                            </TableCell>
                            
                            <TableCell>
                              <Chip
                                icon={employee.role === 'project_manager' ? 
                                  <AdminIcon fontSize="small" /> : 
                                  <PersonIcon fontSize="small" />
                                }
                                label={formatRoleName(employee.role)} 
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(getRoleColor(employee.role), 0.1),
                                  color: getRoleColor(employee.role),
                                  fontWeight: 600,
                                  borderRadius: 1.5,
                                  py: 0.8,
                                  border: `1px solid ${alpha(getRoleColor(employee.role), 0.2)}`,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 8px ${alpha(getRoleColor(employee.role), 0.2)}`
                                  }
                                }}
                              />
                            </TableCell>
                              <TableCell>
                            {employee.department ? (
                              <Chip 
                                label={employee.department}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.info.main, 0.05),
                                  color: theme.palette.info.dark,
                                  borderRadius: 1.5,
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                  fontWeight: 500,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 8px ${alpha(theme.palette.info.main, 0.15)}`
                                  }
                                }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Not specified
                              </Typography>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '80%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={employee.availability_percentage !== undefined ? employee.availability_percentage : 100}
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.background.default, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 4,
                                      background: employee.availability_percentage > 70 ? 
                                        `linear-gradient(90deg, ${theme.palette.success.light}, ${theme.palette.success.main})` :
                                        employee.availability_percentage > 30 ?
                                        `linear-gradient(90deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})` :
                                        `linear-gradient(90deg, ${theme.palette.error.light}, ${theme.palette.error.main})`
                                    },
                                    boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`
                                  }} 
                                />
                              </Box>
                              <Typography 
                                variant="caption" 
                                fontWeight={600}
                                sx={{
                                  color: employee.availability_percentage > 70 ? 
                                    theme.palette.success.main :
                                    employee.availability_percentage > 30 ?
                                    theme.palette.warning.main :
                                    theme.palette.error.main
                                }}
                              >
                                {employee.availability_percentage !== undefined ? `${employee.availability_percentage}%` : "100%"}
                              </Typography>
                            </Box>
                          </TableCell>
                            <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Edit Employee">
                                <IconButton
                                  color="primary"
                                  onClick={() => navigate(`/employees/${employee.id}`)}
                                  size="small"
                                  sx={{ 
                                    boxShadow: theme.shadows[1],
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: theme.shadows[3],
                                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Delete Employee">
                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    setEmployeeToDelete(employee);
                                    setOpenDeleteDialog(true);
                                  }}
                                  size="small"
                                  sx={{ 
                                    boxShadow: theme.shadows[1],
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: theme.shadows[3],
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                    
                    {paginatedEmployees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 3 }}>
                            <PersonIcon fontSize="large" sx={{ fontSize: '3rem', color: alpha(theme.palette.text.secondary, 0.3) }} />
                            <Typography variant="h6" color="text.secondary">
                              No employees found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '400px', textAlign: 'center' }}>
                              {employees.length > 0 
                                ? "Try adjusting your search or filter criteria"
                                : "Start by registering a new employee to your team"
                              }
                            </Typography>
                            {employees.length === 0 && (
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<PersonAddIcon />}
                                onClick={() => navigate('/register-employee')}
                                sx={{ mt: 2 }}
                              >
                                Register First Employee
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
            
            {/* Pagination control */}
            {filteredEmployees.length > rowsPerPage && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  p: 2,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Pagination
                  count={Math.ceil(filteredEmployees.length / rowsPerPage)}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                  color="primary"
                  showFirstButton
                  showLastButton
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateY(-1px)'
                      }
                    },
                    '& .Mui-selected': {
                      backgroundColor: `${theme.palette.primary.main} !important`,
                      color: 'white'
                    }
                  }}
                />              </Box>
            )}
          </Card>
          </motion.div>
        </AnimatePresence>
        
        {/* Delete Employee Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => !isDeleting && setOpenDeleteDialog(false)}
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: theme.shadows[10],
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            color: theme.palette.error.main,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <Box display="flex" alignItems="center">
              <DeleteIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Delete Employee</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2, minWidth: '400px' }}>
            <DialogContentText>
              Are you sure you want to delete <strong>{employeeToDelete?.full_name}</strong>? This action cannot be undone, and all project allocations for this employee will be removed.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button 
              onClick={() => setOpenDeleteDialog(false)}
              variant="outlined"
              disabled={isDeleting}
              sx={{ borderWidth: 2, fontWeight: 500 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteEmployee} 
              variant="contained" 
              color="error"
              startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
              disabled={isDeleting}
              sx={{ 
                fontWeight: 600,
                background: theme.palette.gradients.error,
                '&:hover': {
                  background: theme.palette.gradients.error,
                  filter: 'brightness(0.9)'
                }
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Employee'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Employee Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              boxShadow: theme.shadows[5],
              borderRadius: 2,
              minWidth: 180,
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => {
            navigate(`/employees/${selectedEmployee?.id}`);
            handleMenuClose();
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
            Edit Profile
          </MenuItem>
          <MenuItem onClick={() => {
            // Would navigate to view projects page filtered to this employee
            navigate('/view-projects', { 
              state: { employeeFilter: selectedEmployee?.id } 
            });
            handleMenuClose();
          }}>
            <WorkIcon fontSize="small" sx={{ mr: 1.5 }} />
            View Projects
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem 
            onClick={() => {
              setEmployeeToDelete(selectedEmployee);
              setOpenDeleteDialog(true);
              handleMenuClose();
            }}
            sx={{ color: theme.palette.error.main }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
            Delete Employee
          </MenuItem>
        </Menu>
        
        {/* Snackbar notification */}        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({...snackbar, open: false})}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={Zoom}
        >
          <Alert 
            onClose={() => setSnackbar({...snackbar, open: false})} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ width: '100%', boxShadow: theme.shadows[3] }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default Employees;