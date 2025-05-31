import React, { useContext, useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Work,
  People,
  Tune,
  AssignmentInd,
  Person,
  Assessment,
  Logout,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import AuthContext from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleCloseUserMenu();
  };
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const dashboardLink = user?.role === "employee" ? "/employee-dashboard" : "/dashboard";

  // Navigation items based on user role
  const navItems = user?.role === "project_manager" 
    ? [
        { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
        { text: "Projects", icon: <Work />, path: "/view-projects" },
        { text: "Employees", icon: <People />, path: "/employees" },
        { text: "Resource Optimization", icon: <Tune />, path: "/resource-optimization" },
        { text: "Employee Matching", icon: <AssignmentInd />, path: "/employee-matching" },
      ] 
    : user?.role === "employee"
    ? [
        { text: "Dashboard", icon: <Dashboard />, path: "/employee-dashboard" },
        { text: "My Projects", icon: <Work />, path: "/employee-projects" },
        { text: "My Profile", icon: <Person />, path: "/employee-profile" },
        { text: "My Performance", icon: <Assessment />, path: "/employee-performance" },
      ]
    : [];

  const drawer = (
    <Box sx={{ width: 250, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Avatar sx={{ width: 60, height: 60, mb: 1, bgcolor: 'primary.main' }}>
          {user?.full_name?.charAt(0) || user?.username?.charAt(0) || "U"}
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {user?.full_name || user?.username || "User"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.role === "project_manager" ? "Project Manager" : "Employee"}
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            component={RouterLink} 
            to={item.path} 
            key={item.text}
            onClick={handleDrawerToggle}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <ListItem 
        onClick={handleLogout}
        sx={{
          '&:hover': {
            bgcolor: 'rgba(239, 68, 68, 0.08)'
          },
          cursor: 'pointer'
        }}
      >
        <ListItemIcon sx={{ color: 'error.main' }}>
          <Logout />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          background: 'linear-gradient(90deg, #111827 0%, #1F2937 100%)'
        }}
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile menu button */}
            {user && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2, display: { sm: 'flex', md: 'none' } }}
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Logo */}
            <Typography
              variant="h4"
              noWrap
              component={RouterLink}
              to={user ? dashboardLink : "/login"}
              sx={{
                mr: 2,
                display: 'flex',
                fontWeight: 700,
                letterSpacing: '.06rem',
                color: 'inherit',
                textDecoration: 'none',
                background: 'linear-gradient(45deg, #818CF8, #6366F1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AIRAS
            </Typography>

            {/* Desktop navigation */}
            {user && (
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      my: 2,
                      mx: 0.5,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.08)',
                      },
                    }}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {/* User menu */}
            {user ? (
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {user.full_name?.charAt(0) || user.username?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    elevation: 2,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                >
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>            ) : (
              !isAuthPage && (
                <Box sx={{ display: 'flex' }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    color="primary"
                    variant="contained"
                    sx={{ mr: 1 }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    color="secondary"
                    variant="outlined"
                  >
                    Register
                  </Button>
                </Box>
              )
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;