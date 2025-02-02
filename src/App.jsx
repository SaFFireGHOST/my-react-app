import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';
import {ClipLoader,RotateLoader,GridLoader} from "react-spinners";
import { Circle, Heart ,Roller,Grid} from 'react-spinners-css';

const API_URL = 'https://backend-app-t0ym.onrender.com/predict';
import "./App.css"
const App = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  const handleUpload = (event) => {
    setImage(false)
    setPrediction(false)
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
      setIsCameraOn(false);
    }
  };

  const capturePhoto = () => {
    setImage(false)
    setPrediction(false)
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setIsCameraOn(false);

    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => setImageFile(new File([blob], "captured.jpg", { type: "image/jpeg" })));
  };

  const getPrediction = async () => {
    if (!imageFile) return;
    setLoading(true);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error();

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Error uploading image:', error);
      setPrediction({ error: 'Failed to get prediction' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Image Prediction App</h1>

      <div style={styles.imageContainer}>
        {isCameraOn ? (
          <div style={styles.cameraContainer}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={styles.webcam}
            />
            <div style={styles.gridOverlay}>
              {[...Array(9)].map((_, index) => (
                <div key={index} style={styles.gridCell}></div>
              ))}
            </div>
          </div>
        ) : image ? (
          <img src={image} alt="Selected" style={styles.imageFrame} />
        ) : (
          <div style={styles.placeholder}>No image selected</div>
        )}
      </div>

      <div style={styles.buttonContainer}>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button
          style={styles.button}
          onClick={() => fileInputRef.current.click()}
        >
          Upload Image
        </button>
        <button
          style={styles.button}
          onClick={() => isCameraOn ? capturePhoto() : setIsCameraOn(true)}
        >
          {isCameraOn ? 'Capture Photo' : (
            <div style={styles.buttonContent}>
              <Camera size={20} />
              <span style={{ marginLeft: '8px' }}>Use Camera</span>
            </div>
          )}
        </button>
      </div>

      {image && (
        <button
          style={styles.predictButton}
          onClick={getPrediction}
        >
          Get Prediction
        </button>
      )}

      {loading && (
        <div style={styles.spinnerContainer}>
          {/* <div style={styles.spinner}></div> */}
         
          <Roller color="#a571de"
            loading={loading}
            size={40} />

            {/* <Grid color="#a571de"
            loading={loading}

            size={80} /> */}

          <p>Processing image...</p>
        </div>
      )}


      {prediction && (
        <div style={{
          ...styles.resultContainer,
          backgroundColor: prediction.prediction === 'Lesion' ? '#ffebee' : '#e8f5e9',
        }}>
          <h2 style={styles.resultHeading}>Prediction Result</h2>
          <p style={{
            color: prediction.prediction === 'Lesion' ? '#c62828' : '#2e7d32'
          }}>
            Prediction: {prediction.prediction}
          </p>
          <p>Confidence: {prediction.confidence}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  spinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  imageContainer: {
    width: '400px',
    height: '400px',
    margin: '0 auto 20px',
    position: 'relative',
  },
  imageFrame: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #ddd',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    border: '2px dashed #ddd',
    color: '#666',
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  webcam: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
  },
  gridCell: {
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#007AFF',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  predictButton: {
    backgroundColor: '#9C27B0',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  resultContainer: {
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
  },
  resultHeading: {
    fontSize: '20px',
    marginBottom: '10px',
    color: '#333',
  },
};

export default App;