import React, { useState,useEffect } from 'react';
import DrawingBoard from './DrawingBoard';
import UploadImage from './UploadImage';
import './App.css';

function App() {
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    if (predictions) {
      console.log('Predictions updated:', predictions);  // Add this line
    }
  }, [predictions]);

  return (
    <div className="app">
      <header>
        <h1>Image Predictor</h1>
      </header>
      <main className="container">
        <section className="input-section">
          <h2>Choose Your Input</h2>
          <div className="input-options">
            <UploadImage setPredictions={setPredictions} />
            <DrawingBoard setPredictions={setPredictions} />
          </div>
        </section>
        <section className="results-section">
          <h2>Predictions</h2>
          {predictions ? (
            <div className="predictions">
              <p className="top-prediction">
                <strong>{predictions.top_prediction.label}: {predictions.top_prediction.probability}</strong>
              </p>
              <ul className="other-predictions">
                {predictions.others.map((pred, idx) => (
                  <li key={idx}>{pred.label}: {pred.probability}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Waiting for an image...</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;