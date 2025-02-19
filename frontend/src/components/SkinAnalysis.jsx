import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/SkinAnalysis.module.css';
import { FaCamera, FaSmile, FaVideo, FaTimes } from 'react-icons/fa';

function SkinAnalysis() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [skinTone, setSkinTone] = useState('');
  const [skinToneReason, setSkinToneReason] = useState('');
  const [skinAnalysis, setSkinAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [typedResults, setTypedResults] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);


  useEffect(() => {
    const loggedInUsername = localStorage.getItem('lastLoggedInUser');
    if (loggedInUsername) {
      setUsername(loggedInUsername);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      const previewURL = URL.createObjectURL(selectedFile);
      setImagePreview(previewURL);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Failed to access camera. Please allow camera permissions.');
    }
};

const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Flip the image horizontally (mirror effect for saving)
    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    // Draw the video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to Blob and create a File
    canvas.toBlob((blob) => {
      const capturedFile = new File([blob], 'captured_photo.jpg', { type: 'image/jpeg' });

      setFile(capturedFile);
      setImagePreview(URL.createObjectURL(blob));

      // Stop the camera after capture
      stopCamera();
    }, 'image/jpeg');
};

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const analyzeBoth = async () => {
    if (!file) {
      alert('Please upload or capture an image');
      return;
    }

    setLoading(true);
    setTypedResults('');
    setSkinToneReason('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const [skinToneResponse, skinAnalysisResponse] = await Promise.all([
        axios.post('http://localhost:8000/analyze-skin-tone/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
        axios.post('http://localhost:8000/analyze-skin/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      ]);

      setSkinTone(skinToneResponse.data.skin_tone);
      setSkinToneReason(skinToneResponse.data.reason);

      setSkinAnalysis(skinAnalysisResponse.data.skin_analysis);

      const skinAnalysisData = skinAnalysisResponse.data.skin_analysis;
      let resultsText = '';
      if (skinAnalysisData?.health !== undefined) resultsText += `Health: ${skinAnalysisData.health.toFixed(2)}\n`;
      if (skinAnalysisData?.stain !== undefined) resultsText += `Stain: ${skinAnalysisData.stain.toFixed(2)}\n`;
      if (skinAnalysisData?.dark_circle !== undefined) resultsText += `Dark Circles: ${skinAnalysisData.dark_circle.toFixed(2)}\n`;
      if (skinAnalysisData?.acne !== undefined) resultsText += `Acne: ${skinAnalysisData.acne.toFixed(2)}\n`;

      typeResults(resultsText.trim());
    } catch (error) {
      console.error('Error analyzing skin:', error);
      setTypedResults('Error during skin analysis.');
    } finally {
      setLoading(false);
    }
  };

  const typeResults = (text) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypedResults((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  return (
    <div className={styles.container}>
      <div className={styles.welcomeLogoutSection}>
        {username && <p>Welcome, <strong>{username}</strong></p>}
      </div>

      <div className={styles.skinAnalysis}>
        <h2>Skin Analysis</h2>

        {imagePreview && (
          <div className={styles.imagePreview}>
            <img src={imagePreview} alt="Uploaded Preview" />
          </div>
        )}

        <input type="file" onChange={handleFileChange} id="fileUpload" hidden />
        <label htmlFor="fileUpload" className={styles.uploadLabel}>
          <FaCamera /> Upload Image
        </label>

        <button onClick={startCamera} className={`${styles.button} ${styles.cameraButton}`}>
          <FaVideo /> Take a Photo
        </button>

        {isCameraOpen && (
          <div className={styles.cameraContainer}>
            <video ref={videoRef} autoPlay className={styles.cameraFeed}></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <button onClick={capturePhoto} className={styles.captureButton}>Capture</button>
            <button onClick={stopCamera} className={styles.closeCameraButton}><FaTimes /> Close</button>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button onClick={analyzeBoth} className={`${styles.button} ${styles.analyzeButton}`}>
            Analyze Skin
          </button>
        </div>

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Analyzing skin, please wait...</p>
          </div>
        )}

        {skinAnalysis && (
          <div className={styles.resultsContainer}>
            <h3>Skin Analysis Results: </h3>
            <p className={styles.typewriterText}>{typedResults}</p>

            {skinTone && (
              <div className={styles.skinToneContainer}>
                <p className={styles.skinToneResult}>
                  <FaSmile /> <strong>Detected Skin Tone:</strong> {skinTone}
                </p>
                {skinToneReason && <p className={styles.skinToneReason}><strong>Reason:</strong> {skinToneReason}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SkinAnalysis;
