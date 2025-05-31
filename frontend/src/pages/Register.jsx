import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Container,
  CardContent, 
  TextField, 
  Button, 
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  CircularProgress
} from "@mui/material";
import { 
  Email, 
  Lock, 
  Person, 
  Work, 
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import { motion } from "framer-motion";

const Register = () => {  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Custom styles to override autofill behavior - matching Login page
  const inputProps = {
    sx: {
      bgcolor: 'transparent',
      // Override autofill styles directly
      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px #1F2937 inset !important",
        WebkitTextFillColor: "#F9FAFB !important",
        caretColor: "#F9FAFB",
      },
      "&:-webkit-autofill:hover": {
        WebkitBoxShadow: "0 0 0 1000px #1F2937 inset !important",
      },
      "&:-webkit-autofill:focus": {
        WebkitBoxShadow: "0 0 0 1000px #1F2937 inset !important",
      },
      "&:-webkit-autofill:active": {
        WebkitBoxShadow: "0 0 0 1000px #1F2937 inset !important",
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role: "project_manager",
          department
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000); // Redirect to login after 2 seconds
      } else {
        const data = await response.json();
        console.error("Registration error response:", data);
        setError(data.detail || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Paper
            elevation={6}
            sx={{
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 1,
                background: 'linear-gradient(90deg, #4F46E5, #6366F1)',
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Typography 
                  component="h1" 
                  variant="h4" 
                  gutterBottom
                  sx={{ 
                    textAlign: 'center',
                    fontWeight: 700,
                    mb: 3,
                    background: 'linear-gradient(45deg, #818CF8, #6366F1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Create Account
                </Typography>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Registration successful! Redirecting to login...
                    </Alert>
                  </motion.div>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="fullName"
                    label="Full Name"
                    name="fullName"
                    autoComplete="name"
                    autoFocus
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    InputProps={{
                      ...inputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'transparent',
                        '& fieldset': {
                          borderColor: 'rgba(99, 102, 241, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.light',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'transparent',
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                        '&.Mui-focused:hover': {
                          backgroundColor: 'transparent',
                        }
                      },
                      '& input': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      ...inputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'transparent',
                        '& fieldset': {
                          borderColor: 'rgba(99, 102, 241, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.light',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'transparent',
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                        '&.Mui-focused:hover': {
                          backgroundColor: 'transparent',
                        }
                      },
                      '& input': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    id="password"
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      ...inputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'transparent',
                        '& fieldset': {
                          borderColor: 'rgba(99, 102, 241, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.light',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'transparent',
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                        '&.Mui-focused:hover': {
                          backgroundColor: 'transparent',
                        },
                      },
                      '& input': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="department"
                    label="Department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    InputProps={{
                      ...inputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'transparent',
                        '& fieldset': {
                          borderColor: 'rgba(99, 102, 241, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.light',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'transparent',
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                        '&.Mui-focused:hover': {
                          backgroundColor: 'transparent',
                        }
                      },
                      '& input': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  />

                  <Button
                    component={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ 
                      mb: 3, 
                      py: 1.5,
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
                      boxShadow: '0 4px 20px 0 rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" display="inline" sx={{ mr: 1 }}>
                      Already have an account?
                    </Typography>
                    <Link 
                      component={RouterLink}
                      to="/login"
                      variant="body2"
                      sx={{ 
                        color: 'primary.main',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Sign In
                    </Link>
                  </Box>
                </Box>
              </motion.div>
            </CardContent>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Register;