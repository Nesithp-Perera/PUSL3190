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
  LinearProgress,
  Alert,
  CircularProgress,
  Container,
  Paper,
  alpha,
  useTheme,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Compare as CompareIcon,
  CheckCircle as CheckCircleIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Info as InfoIcon,
  EmojiEvents as EmojiEventsIcon,
  BuildCircle as BuildCircleIcon,
  Recommend as RecommendIcon
} from "@mui/icons-material";

const EmployeePerformance = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [employeeData, setEmployeeData] = useState(null);
  const [averagePerformance, setAveragePerformance] = useState(2.5); // Default average
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    danger: 'linear-gradient(45deg, #DC2626 30%, #EF4444 90%)',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Only use the /me endpoint which we know exists
        const employeeResponse = await fetch(`http://localhost:8000/api/auth/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (employeeResponse.ok) {
          const empData = await employeeResponse.json();
          
          // Normalize data with defaults
          const normalizedEmpData = {
            ...empData,
            average_performance: empData.average_performance ?? 0, 
            department: empData.department || ""
          };
          
          setEmployeeData(normalizedEmpData);
          
          // Set a default department average - we don't have a real endpoint for this
          setAveragePerformance(2.5);
          
          // Do not try to call the department-stats endpoint since it doesn't exist
        } else {
          const errorText = await employeeResponse.text();
          console.error("Failed to fetch employee data:", errorText);
          throw new Error("Failed to fetch performance data");
        }
      } catch (error) {
        console.error("Error fetching performance data:", error);
        setError("Failed to load performance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.id) {
      fetchData();
    }
  }, [user]);

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
            Loading performance data...
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
              textAlign: 'center'
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
              textAlign: 'center'
            }}
          >
            Could not find your employee data. Please contact your administrator.
          </Alert>
        </motion.div>
      </Box>
    );
  }

  const performance = employeeData.average_performance || 0;
  const getPerformanceCategory = (score) => {
    if (score >= 4.5) return { category: "Exceptional", color: "success", gradient: gradientStyles.success };
    if (score >= 3.5) return { category: "Excellent", color: "success", gradient: gradientStyles.success };
    if (score >= 2.5) return { category: "Good", color: "info", gradient: gradientStyles.info };
    if (score >= 1.5) return { category: "Needs Improvement", color: "warning", gradient: gradientStyles.warning };
    return { category: "Poor", color: "error", gradient: gradientStyles.danger };
  };

  const userPerformance = getPerformanceCategory(performance);
  const comparison = performance > averagePerformance ? "above" : 
                     performance < averagePerformance ? "below" : "at";

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
            My Performance
          </Typography>
        </motion.div>
      </Box>
      
      <Grid container spacing={3} justifyContent="center" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
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
                  <StarIcon sx={{ mr: 1, color: theme.palette[userPerformance.color].main }} />
                  <Typography variant="h5" component="div" fontWeight={600}>
                    Performance Score
                  </Typography>
                </Box>
              }
              sx={{ 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: alpha(theme.palette[userPerformance.color].main, 0.05),
                '& .MuiCardHeader-content': {
                  flex: '1 1 auto',
                  textAlign: 'center'
                }
              }}
            />
            
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      background: userPerformance.gradient,
                      boxShadow: theme.shadows[4],
                      position: 'relative',
                    }}
                  >
                    <Typography variant="h2" component="div" fontWeight={700} color="white">
                      {performance.toFixed(1)}
                    </Typography>
                  </Avatar>
                </motion.div>
              </Box>
              
              <Typography variant="h6" textAlign="center" mb={1}>
                out of 5.0
              </Typography>
              
              <Box sx={{ width: '100%', mt: 3 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <Box sx={{ width: '100%', height: 12, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 6, position: 'relative' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: `${performance * 20}%`,
                        borderRadius: 6,
                        backgroundImage: userPerformance.gradient,
                        transition: 'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)'
                      }}
                    />
                    
                    {[1, 2, 3, 4, 5].map((mark) => (
                      <Box 
                        key={mark}
                        sx={{
                          position: 'absolute',
                          left: `${mark * 20 - 10}%`,
                          top: '100%',
                          transform: 'translateX(-50%)',
                          mt: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            height: 8,
                            width: 2,
                            bgcolor: 'text.disabled',
                            mb: 0.5
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {mark}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </motion.div>
              </Box>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Typography variant="h5" component="div" sx={{ mt: 4, fontWeight: 600 }}>
                  Your performance is rated as{' '}
                  <Box 
                    component="span" 
                    sx={{ 
                      color: theme.palette[userPerformance.color].main,
                      background: alpha(theme.palette[userPerformance.color].main, 0.1),
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                    }}
                  >
                    {userPerformance.category}
                  </Box>
                </Typography>
              </motion.div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
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
                  <CompareIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                  <Typography variant="h5" component="div" fontWeight={600}>
                    Performance Comparison
                  </Typography>
                </Box>
              }
              sx={{ 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: alpha(theme.palette.info.main, 0.05),
                '& .MuiCardHeader-content': {
                  flex: '1 1 auto',
                  textAlign: 'center'
                }
              }}
            />
            
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Your performance score is{' '}
                  <Box 
                    component="span" 
                    sx={{ 
                      fontWeight: 600,
                      color: performance > averagePerformance ? 
                        theme.palette.success.main : 
                        performance < averagePerformance ? 
                          theme.palette.error.main : 
                          theme.palette.info.main,
                    }}
                  >
                    {comparison}
                  </Box>{' '}
                  the average in your department.
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Your Score
                    </Typography>
                    <Typography 
                      variant="h4" 
                      fontWeight={600} 
                      sx={{ color: theme.palette[userPerformance.color].main }}
                    >
                      {performance.toFixed(1)}
                    </Typography>
                  </Box>
                  
                  {performance !== averagePerformance && (
                    <Box sx={{ textAlign: 'center', display: 'flex', alignItems: 'center' }}>
                      {performance > averagePerformance ? (
                        <ArrowUpwardIcon sx={{ color: theme.palette.success.main }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ color: theme.palette.error.main }} />
                      )}
                    </Box>
                  )}
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Department Average
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="info.main">
                      {averagePerformance.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
                
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      position: 'relative',
                      width: '100%',
                      maxWidth: 400,
                      height: 8,
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: 4,
                      mx: 'auto',
                      mt: 4
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        left: `${averagePerformance * 20}%`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: 16,
                        width: 2,
                        bgcolor: theme.palette.info.main,
                        zIndex: 2
                      }}
                    />
                    
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        left: `${averagePerformance * 20}%`,
                        bottom: -24,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <Typography variant="caption" color="info.main">
                        Avg
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        left: `${performance * 20}%`,
                        top: -24,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <Typography variant="caption" color={theme.palette[userPerformance.color].main}>
                        You
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        height: '100%',
                        width: `${performance * 20}%`,
                        borderRadius: 4,
                        backgroundImage: userPerformance.gradient,
                      }}
                    />
                  </Box>
                </motion.div>
              </Box>
              
              <Divider sx={{ mb: 3, mt: 4 }} />
              
              <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <InfoIcon sx={{ mr: 1, fontSize: 20, color: 'info.main' }} />
                <Typography variant="body2" color="text.secondary" align="center">
                  Performance scores are determined by project managers based on your contributions to projects.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 3 }} justifyContent="center" component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        <Grid item xs={12} md={10} component={motion.div} variants={itemVariants}>
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
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AssessmentIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                  <Typography variant="h5" component="div" fontWeight={600}>
                    Performance Insights
                  </Typography>
                </Box>
              }
              sx={{ 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: alpha(theme.palette.secondary.main, 0.05),
                '& .MuiCardHeader-content': {
                  flex: '1 1 auto',
                  textAlign: 'center'
                }
              }}
            />
            
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="stretch" justifyContent="center">
                <Grid item xs={12} sm={8} md={4} component={motion.div} variants={itemVariants}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      height: '100%',
                      background: alpha(theme.palette.success.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-4px)',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                        <EmojiEventsIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                        <Typography variant="h6" align="center" fontWeight={600} color="success.main">
                          Strengths
                        </Typography>
                      </Box>
                      
                      <List dense sx={{ width: '100%' }}>
                        {performance >= 3.5 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircleIcon sx={{ color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Strong technical performance" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {performance >= 3.0 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircleIcon sx={{ color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Good project contributions" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {performance >= 2.5 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircleIcon sx={{ color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Reliable team member" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {employeeData.skills?.length > 3 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircleIcon sx={{ color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Diverse skill set" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {performance < 2.5 && !employeeData.skills?.length && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemText 
                              primary="No strengths identified yet" 
                              primaryTypographyProps={{ align: 'center', color: 'text.secondary' }} 
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={8} md={4} component={motion.div} variants={itemVariants}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      height: '100%',
                      background: alpha(theme.palette.warning.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-4px)',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                        <BuildCircleIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                        <Typography variant="h6" align="center" fontWeight={600} color="warning.main">
                          Areas for Improvement
                        </Typography>
                      </Box>
                      
                      <List dense sx={{ width: '100%' }}>
                        {performance < 3.5 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <ArrowUpwardIcon sx={{ color: 'warning.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Technical proficiency" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {performance < 3.0 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <ArrowUpwardIcon sx={{ color: 'warning.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Project contributions" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {performance < 2.5 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <ArrowUpwardIcon sx={{ color: 'warning.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Reliability" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {!employeeData.skills?.length && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <ArrowUpwardIcon sx={{ color: 'warning.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Add skills to your profile" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {employeeData.skills?.length < 3 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <ArrowUpwardIcon sx={{ color: 'warning.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Expand your skill set" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {performance >= 4.5 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemText 
                              primary="Keep up the excellent work!" 
                              primaryTypographyProps={{ align: 'center', color: 'success.main', fontWeight: 500 }} 
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={8} md={4} component={motion.div} variants={itemVariants}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      height: '100%',
                      background: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-4px)',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                        <RecommendIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                        <Typography variant="h6" align="center" fontWeight={600} color="info.main">
                          Recommendations
                        </Typography>
                      </Box>
                      
                      <List dense sx={{ width: '100%' }}>
                        {performance < 3.0 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <InfoIcon sx={{ color: 'info.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Focus on improving core skills" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {employeeData.skills?.length < 5 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <InfoIcon sx={{ color: 'info.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Add more skills to your profile" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {performance < 4.0 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <InfoIcon sx={{ color: 'info.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Seek feedback from project managers" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        {performance < 3.5 && (
                          <ListItem sx={{ justifyContent: 'center' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <InfoIcon sx={{ color: 'info.main' }} />
                            </ListItemIcon>
                            <ListItemText primary="Consider professional development opportunities" primaryTypographyProps={{ align: 'center' }} />
                          </ListItem>
                        )}
                        <ListItem sx={{ justifyContent: 'center' }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <InfoIcon sx={{ color: 'info.main' }} />
                          </ListItemIcon>
                          <ListItemText primary="Maintain regular communication with your team" primaryTypographyProps={{ align: 'center' }} />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmployeePerformance;
