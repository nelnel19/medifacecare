import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/SkinAnalysis.module.css';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaSmile } from 'react-icons/fa';

function SkinAnalysis() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [skinTone, setSkinTone] = useState('');
  const [skinAnalysis, setSkinAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [typedResults, setTypedResults] = useState(''); // Typewriter effect state

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

  const analyzeBoth = async () => {
    if (!file) {
      alert('Please upload an image');
      return;
    }
  
    setLoading(true);
    setTypedResults(''); // Reset typed results on new analysis
  
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
      setSkinAnalysis(skinAnalysisResponse.data.skin_analysis);
  
      // Extract the skin analysis categories
      const skinAnalysisData = skinAnalysisResponse.data.skin_analysis;
      const health = skinAnalysisData?.health ?? null;
      const stain = skinAnalysisData?.stain ?? null;
      const darkCircle = skinAnalysisData?.dark_circle ?? null;
      const acne = skinAnalysisData?.acne ?? null;
  
      // Only include categories that have valid values
      let resultsText = '';
      if (health !== null) {
        resultsText += `HHealth: ${health.toFixed(2)}\n`;
      }
      if (stain !== null) {
        resultsText += `Stain: ${stain.toFixed(2)}\n`;
      }
      if (darkCircle !== null) {
        resultsText += `Dark Circles: ${darkCircle.toFixed(2)}\n`;
      }
      if (acne !== null) {
        resultsText += `Acne: ${acne.toFixed(2)}\n`;
      }
  
      // Set the results with the formatted text
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

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastLoggedInUser');
    setShowModal(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      {/* Welcome and Logout Section */}
      <div className={styles.welcomeLogoutSection}>
        {username && <p>Welcome, <strong>{username}</strong></p>}
      </div>

      <div className={styles.skinAnalysis}>
        <h2>Skin Analysis</h2>

        {/* Image Preview Box */}
        {imagePreview && (
          <div className={styles.imagePreview}>
            <img src={imagePreview} alt="Uploaded Preview" />
          </div>
        )}

        {/* Upload Button */}
        <input type="file" onChange={handleFileChange} id="fileUpload" hidden />
        <label htmlFor="fileUpload" className={styles.uploadLabel}>
          <FaCamera /> Upload Image
        </label>

        <div className={styles.buttonGroup}>
          <button onClick={analyzeBoth} className={`${styles.button} ${styles.analyzeButton}`}>
            Analyze Skin
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Analyzing skin, please wait...</p>
          </div>
        )}

        {skinTone && (
          <p className={styles.skinToneResult}>
            <FaSmile /> Detected Skin Tone: <strong>{skinTone}</strong>
          </p>
        )}

        {/* Typewriter Effect Results Container */}
        {skinAnalysis && (
          <div className={styles.typewriterContainer}>
            <h3>Skin Analysis Results: </h3>
            <p className={styles.typewriterText}>{typedResults}</p>
          </div>
        )}
      </div>

      {/* Modal for logout confirmation */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Are you sure you want to log out?</h3>
            <div className={styles.modalActions}>
              <button onClick={confirmLogout} className={styles.confirmButton}>Yes</button>
              <button onClick={cancelLogout} className={styles.cancelButton}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
    </div>
  );
}

export default SkinAnalysis;
