import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component={motion.footer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      sx={{
        py: 3,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.background.paper,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 700,
          mb: 1,
          background: 'linear-gradient(45deg, #818CF8, #6366F1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        AIRAS
      </Typography>
      <Typography variant="caption" color="text.secondary">
        &copy; {currentYear} AIRAS. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;