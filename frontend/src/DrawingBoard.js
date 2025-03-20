import React, { useRef, useEffect, useState } from 'react';

function DrawingBoard({ setPredictions }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Initialize canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const startDrawing = (e) => {
      setDrawing(true);
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      // Draw a dot immediately on mousedown
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    const draw = (e) => {
      if (!drawing) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    const stopDrawing = async () => {
      setDrawing(false);
      // Trigger prediction only when drawing is finished
      await predictOnFinish();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    const predictOnFinish = async () => {
      // Check if canvas is empty (all white)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const isEmpty = imageData.data.every((pixel, i) => {
        // Check RGBA values: white is (255, 255, 255, 255)
        return i % 4 === 3 ? pixel === 255 : pixel === 255;
      });
      if (isEmpty) {
        console.log('Canvas is empty, skipping prediction');
        setPredictions(null);
        return;
      }

      setIsLoading(true);
      console.log('Sending prediction request after drawing finished...');

      const imgData = canvas.toDataURL('image/png');
      const blob = await (await fetch(imgData)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'drawing.png');

      try {
        const response = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const result = await response.json();
        console.log('Prediction result:', result);
        setPredictions(result);
      } catch (error) {
        console.error('Prediction failed:', error);
        alert('Failed to get prediction. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [drawing, setPredictions]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPredictions(null);
  };

  return (
    <div className="drawing-container">
      <h3>Draw Here</h3>
      <canvas ref={canvasRef} width={400} height={400} className="canvas" />
      <button onClick={clearCanvas} className="clear-button">Clear</button>
      {isLoading && <p>Predicting...</p>}
    </div>
  );
}

export default DrawingBoard;