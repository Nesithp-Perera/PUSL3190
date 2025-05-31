import { createTheme } from '@mui/material/styles';

// Custom dark theme with sleek, minimalistic colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', // Indigo
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EC4899', // Pink
      light: '#F472B6',
      dark: '#DB2777',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0F172A', // Darker blue-gray for more sophisticated look
      paper: '#1E293B',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      disabled: '#6B7280',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    divider: 'rgba(107, 114, 128, 0.12)',
    // Custom colors for gradients
    gradients: {
      primary: 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
      secondary: 'linear-gradient(45deg, #DB2777 30%, #EC4899 90%)',
      success: 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
      info: 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)',
      warning: 'linear-gradient(45deg, #D97706 30%, #F59E0B 90%)',
      error: 'linear-gradient(45deg, #DC2626 30%, #EF4444 90%)',
      dark: 'linear-gradient(45deg, #111827 30%, #1F2937 90%)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12, // Increased for a more modern look
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 3px 4px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 3px 6px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 3px 8px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 4px 10px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 4px 12px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 5px 14px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 5px 16px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 6px 18px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 6px 20px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 7px 22px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 7px 24px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 8px 26px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 8px 28px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 9px 30px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 9px 32px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 10px 34px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 10px 36px -2px rgba(0, 0, 0, 0.25)',
    '0 0 1px 0 rgba(0, 0, 0, 0.31), 0 11px 38px -2px rgba(0, 0, 0, 0.25)'
  ],
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#6366F1 #1E293B',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1E293B',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#4F46E5',
            borderRadius: '20px',
            '&:hover': {
              backgroundColor: '#6366F1',
            },
          },
          '& .MuiCardHeader-root': {
            padding: '16px 24px',
          },
          '& .MuiCardContent-root': {
            padding: '16px 24px 24px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #4338CA 30%, #4F46E5 90%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #DB2777 30%, #EC4899 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #BE185D 30%, #DB2777 90%)',
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        outlinedSecondary: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          '&.MuiPaper-elevation1': {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease-in-out',
            '&:hover fieldset': {
              borderColor: '#6366F1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366F1',
              boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
            },
          },
          '& .MuiFilledInput-root': {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
            },
            '&.Mui-filled': {
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
            }
          },
          '& .MuiInputBase-input': {
            transition: 'all 0.2s ease-in-out',
            '&:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 1000px #1E293B inset',
              WebkitTextFillColor: '#F9FAFB',
              caretColor: '#F9FAFB',
              borderRadius: 'inherit',
              transition: 'background-color 5000s ease-in-out 0s',
            },
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          borderRadius: 12,
          '&:hover': {
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
          }
        }
      }
    },
    MuiInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            backgroundColor: 'transparent',
          },
          '&:before': {
            borderBottomColor: 'rgba(107, 114, 128, 0.3)',
          },
          '&:hover:not(.Mui-disabled):before': {
            borderBottomColor: '#6366F1',
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6366F1',
            borderWidth: 2,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#818CF8',
          },
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #1E293B inset',
            WebkitTextFillColor: '#F9FAFB',
          }
        },
        input: {
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #1E293B inset',
            WebkitTextFillColor: '#F9FAFB',
            caretColor: '#F9FAFB',
          }
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: {
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #1E293B inset',
            WebkitTextFillColor: '#F9FAFB',
          },
        },
        paper: {
          backgroundImage: 'none',
        }
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          borderBottom: '2px solid rgba(99, 102, 241, 0.2)',
        },
        body: {
          borderBottom: '1px solid rgba(107, 114, 128, 0.1)',
        }
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
          }
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 8,
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
        },
        bar: {
          borderRadius: 10,
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(107, 114, 128, 0.12)',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        filledPrimary: {
          background: 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
        },
        filledSecondary: {
          background: 'linear-gradient(45deg, #DB2777 30%, #EC4899 90%)',
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '8px 16px',
          fontSize: '0.85rem',
        },
        arrow: {
          color: 'rgba(15, 23, 42, 0.95)',
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        filledSuccess: {
          background: 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
        },
        filledInfo: {
          background: 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)',
        },
        filledWarning: {
          background: 'linear-gradient(45deg, #D97706 30%, #F59E0B 90%)',
        },
        filledError: {
          background: 'linear-gradient(45deg, #DC2626 30%, #EF4444 90%)',
        }
      }
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
        }
      }
    }
  },
});

export default theme;