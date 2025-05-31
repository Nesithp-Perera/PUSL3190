import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Paper
} from "@mui/material";
import { 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff 
} from "@mui/icons-material";
import { motion } from "framer-motion";
import AuthContext from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Custom styles to override autofill behavior
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
    setError("");
    console.log("Attempting login with:", username);
    
    try {
      const success = await login(username, password);
      if (success) {
        console.log("Login successful, redirecting based on role");
        
        // Get the user data from localStorage to determine role-based redirection
        const userData = JSON.parse(localStorage.getItem("user"));
        
        if (userData && userData.role === "employee") {
          navigate("/employee-dashboard");
        } else if (userData && userData.role === "project_manager") {
          navigate("/dashboard");
        } else {
          setError("Unknown user role. Please contact support.");
        }
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    }
  };

  const toggleShowPassword = () => {
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
                  Welcome Back
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

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    InputProps={{
                      ...inputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 3,
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
                    autoComplete="current-password"
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
                            onClick={toggleShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 4,
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
                  <Button
                    component={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ 
                      mb: 3, 
                      py: 1.5,
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
                      boxShadow: '0 4px 20px 0 rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    Sign In
                  </Button>
                </Box>
              </motion.div>
            </CardContent>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Login;