import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/startpage.css"; // Updated styles
import { FaShoppingCart, FaSearch } from "react-icons/fa";

function StartPage() {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate("/login");
  };

  return (
    <div className="startpage">
      {/* Navigation Bar */}
      <nav className="navbar">
        <img src="/assets/logo.png" alt="GET-GLOW Logo" className="logo" />
        <ul className="nav-links">
          <li>HOME</li>
          <li>SHOP</li>
          <li>ABOUT US</li>
          <li>CONTACT</li>
        </ul>
        <div className="icons">
          <FaSearch className="icon" />
          <FaShoppingCart className="icon" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-text">
          <h1>Make Your Skin Pop with <span className="highlight">
            MEDIFACECARE</span></h1>
          <p>Snap, Analyze, Glow! Upload or take a photo, and our AI will assess your skin tone and condition, providing personalized skincare tips just for you!</p>
          <button onClick={handleShopNow} className="shop-now-button">Get Started</button>
        </div>
        <div className="hero-image">
          <img src="/assets/skin-care-products (2).png" alt="Skincare Products" />
        </div>
      </div>
    </div>
  );
}

export default StartPage;
