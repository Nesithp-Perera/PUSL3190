import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { Star as StarIcon, StarHalf as StarHalfIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';

const PerformanceIndicator = ({ value, size = "medium", showText = true }) => {
  const theme = useTheme();
  
  // Determine star sizes based on the size prop
  const getStarSize = () => {
    switch(size) {
      case "small": return { fontSize: '1rem' };
      case "large": return { fontSize: '2rem' };
      default: return { fontSize: '1.5rem' };
    }
  };
  
  // Determine text style based on size
  const getTextStyle = () => {
    switch(size) {
      case "small": return { fontSize: '0.8rem' };
      case "large": return { fontSize: '1.2rem' };
      default: return { fontSize: '1rem' };
    }
  };
  
  // Generate stars based on rating value
  const renderStars = () => {
    const stars = [];
    const starSize = getStarSize();
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon 
          key={`full-${i}`} 
          sx={{ 
            color: theme.palette.warning.main,
            ...starSize,
            '&:hover': {
              transform: 'scale(1.2)'
            },
            transition: 'transform 0.2s'
          }} 
        />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <StarHalfIcon 
          key="half" 
          sx={{ 
            color: theme.palette.warning.main,
            ...starSize,
            '&:hover': {
              transform: 'scale(1.2)'
            },
            transition: 'transform 0.2s'
          }} 
        />
      );
    }
    
    // Add empty stars to complete 5 stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarBorderIcon 
          key={`empty-${i}`} 
          sx={{ 
            color: alpha(theme.palette.warning.main, 0.5),
            ...starSize,
            '&:hover': {
              transform: 'scale(1.2)'
            },
            transition: 'transform 0.2s'
          }} 
        />
      );
    }
    
    return stars;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ display: 'flex' }}>
        {renderStars()}
      </Box>
      {showText && (
        <Typography 
          variant="body1" 
          fontWeight={500}
          color="text.secondary"
          sx={getTextStyle()}
        >
          {value.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

export default PerformanceIndicator;
