import React from 'react';

function UploadImage({ onPredictionStart, onPredictionEnd }) {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    onPredictionStart();

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      onPredictionEnd(result);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to get prediction. Check console for details.');
      onPredictionEnd(null);
    }
  };

  return (
    <div className="upload-container">
      <label htmlFor="upload-input">Upload an Image</label>
      <input
        id="upload-input"
        type="file"
        accept="image/*"
        onChange={handleUpload}
      />
    </div>
  );
}

export default UploadImage;