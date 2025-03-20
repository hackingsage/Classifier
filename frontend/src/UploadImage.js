import React from 'react';

function UploadImage({ setPredictions }) {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      setPredictions(result);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to get prediction. Please try again.');
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