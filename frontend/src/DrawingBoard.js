import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ReactSketchCanvas } from 'react-sketch-canvas';

function DrawingBoard({ setPredictions, onPredictionStart, onPredictionEnd }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const timeoutRef = useRef(null);

  // Styles for the canvas
  const canvasStyles = {
    border: '2px solid',
    borderColor: 'divider',
    borderRadius: 2,
    background: 'background.paper',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  // Handle drawing start
  const handleDrawingStart = () => {
    console.log('Drawing started');
    setIsDrawing(true);
  };

  // Handle drawing end
  const handleDrawingEnd = () => {
    console.log('Drawing ended, waiting 500ms to predict...');
    setIsDrawing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      console.log('500ms elapsed, triggering prediction...');
      predictOnFinish();
    }, 500);
  };

  // Export the drawing and send to backend
  const predictOnFinish = async () => {
    console.log('predictOnFinish: Starting prediction process...');
    try {
      if (!canvasRef.current) {
        console.error('Canvas ref is not initialized');
        onPredictionEnd(null);
        return;
      }

      let paths = [];
      try {
        paths = await canvasRef.current.getSketchingPaths();
        console.log('Canvas paths:', paths);
      } catch (error) {
        console.warn('Failed to get sketching paths:', error.message);
      }

      if (!paths || paths.length === 0) {
        console.log('Canvas has no paths, checking blob size...');
        const imgData = await canvasRef.current.exportImage('png');
        const blob = await (await fetch(imgData)).blob();
        console.log('Blob size for empty check:', blob.size);

        if (blob.size < 1000) {
          console.log('Canvas is empty (blob size too small), clearing predictions');
          onPredictionEnd(null);
          return;
        }
      }

      console.log('Canvas has content, proceeding with prediction...');
      onPredictionStart();

      const imgData = await canvasRef.current.exportImage('png');
      console.log('Image data URL (first 50 chars):', imgData.substring(0, 50));
      const blob = await (await fetch(imgData)).blob();
      console.log('Blob created:', { size: blob.size, type: blob.type });

      const formData = new FormData();
      formData.append('image', blob, 'drawing.png');
      console.log('FormData prepared for sending');

      console.log('Sending POST request to http://localhost:5000/predict...');
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      console.log('Response received:', { status: response.status, ok: response.ok });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Prediction result:', result);
      onPredictionEnd(result);
      setPredictions(result); // Ensure state is updated
    } catch (error) {
      console.error('Prediction error:', error.message);
      alert('Failed to get prediction. Check console for details.');
      onPredictionEnd(null);
    }
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      console.log('Canvas cleared');
      onPredictionEnd(null);
    } else {
      console.error('Canvas ref is not initialized for clearCanvas');
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Draw Here
        </Typography>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <ReactSketchCanvas
            ref={canvasRef}
            style={canvasStyles}
            width="100%"
            height="400px"
            strokeWidth={4}
            strokeColor="black"
            backgroundColor="white"
            onStroke={isDrawing ? handleDrawingEnd : handleDrawingStart}
          />
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={clearCanvas}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'white',
              },
            }}
          >
            Clear
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          Draw something and wait for the prediction...
        </Typography>
      </Paper>
    </motion.div>
  );
}

export default DrawingBoard;