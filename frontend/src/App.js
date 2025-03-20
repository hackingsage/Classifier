import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Paper, Typography, IconButton, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DrawingBoard from './DrawingBoard';
import UploadImage from './UploadImage';
import './App.css';

function App() {
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#3b82f6',
      },
      secondary: {
        main: '#2563eb',
      },
      background: {
        default: isDarkMode ? '#0f172a' : '#f8fafc',
        paper: isDarkMode ? '#1e293b' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      h2: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
  });

  const handlePredictionStart = () => {
    console.log('Prediction started, setting loading state...');
    setIsLoading(true);
    setPredictions(null);
  };

  const handlePredictionEnd = (result) => {
    console.log('Prediction ended, updating state:', result);
    setIsLoading(false);
    setPredictions(result);
  };

  // Helper function to parse probability strings (e.g., "99.9%" -> 99.9)
  const parseProbability = (prob) => {
    if (typeof prob !== 'string') return prob || 0;
    const numericValue = parseFloat(prob.replace('%', ''));
    return isNaN(numericValue) ? 0 : numericValue;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', mb: 6 }}>
            <IconButton
              onClick={() => setIsDarkMode(!isDarkMode)}
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                zIndex: 1,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <AutoGraphIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h1" component="h1" align="center">
                  Doodle Classifier
                </Typography>
              </Box>
            </motion.div>
          </Box>

          <Box sx={{ display: 'flex', gap: 4, flexDirection: isMobile ? 'column' : 'row' }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ flex: 1 }}
            >
              <Paper sx={{ p: 4 }}>
                <Typography variant="h2" gutterBottom>
                  Choose Your Input
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <UploadImage
                    setPredictions={setPredictions}
                    onPredictionStart={handlePredictionStart}
                    onPredictionEnd={handlePredictionEnd}
                  />
                  <DrawingBoard
                    setPredictions={setPredictions}
                    onPredictionStart={handlePredictionStart}
                    onPredictionEnd={handlePredictionEnd}
                  />
                </Box>
              </Paper>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ flex: 1 }}
            >
              <Paper sx={{ p: 4 }}>
                <Typography variant="h2" gutterBottom>
                  Predictions
                </Typography>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          border: '3px solid',
                          borderColor: 'primary.main',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                    </motion.div>
                  ) : predictions && predictions.top_prediction ? (
                    <motion.div
                      key="predictions"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                          Top Prediction
                        </Typography>
                        <Paper
                          sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" color="primary">
                              {predictions.top_prediction.label}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                              {parseProbability(predictions.top_prediction.probability).toFixed(1)}%
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Box
                              sx={{
                                height: 8,
                                bgcolor: 'grey.200',
                                borderRadius: 4,
                                overflow: 'hidden',
                              }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${parseProbability(predictions.top_prediction.probability)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                  borderRadius: 4,
                                }}
                              />
                            </Box>
                          </Box>
                        </Paper>
                      </Box>

                      <Typography variant="h6" gutterBottom>
                        Other Predictions
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {predictions.others && predictions.others.length > 0 ? (
                          predictions.others.map((pred, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <Paper sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body1">{pred.label}</Typography>
                                  <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
                                    {parseProbability(pred.probability).toFixed(1)}%
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    height: 6,
                                    bgcolor: 'grey.200',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${parseProbability(pred.probability)}%` }}
                                    transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                                    style={{
                                      height: '100%',
                                      background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                      borderRadius: 3,
                                    }}
                                  />
                                </Box>
                              </Paper>
                            </motion.div>
                          ))
                        ) : (
                          <Typography color="text.secondary">
                            No other predictions available
                          </Typography>
                        )}
                      </Box>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Typography color="text.secondary" align="center">
                        Waiting for an image...
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Paper>
            </motion.div>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;