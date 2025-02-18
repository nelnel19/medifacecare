import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/startpage.css"; // Import the CSS file
import { FaLeaf, FaFlask, FaSpa } from "react-icons/fa"; // Icons for design
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from "react-responsive-carousel";

function StartPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="startpage-container">
      <div className="carousel-container">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={4000}
        >
          <div className="slide">
            <img src="/assets/skincare.jpg" alt="Skincare Routine" />
            <p className="legend">Discover Your Perfect Skincare Routine</p>
          </div>
          <div className="slide">
            <img src="/assets/skincare2.jpg" alt="Healthy Skin" />
            <p className="legend">Track Your Skin Progress</p>
          </div>
          <div className="slide">
            <img src="/assets/skincare3.jpg" alt="Natural Skincare" />
            <p className="legend">Get Personalized Recommendations</p>
          </div>
        </Carousel>
      </div>

      <div className="content">
        <h1>Welcome to MediFaceCare</h1>
        <p>
          Your all-in-one skincare companion. Analyze your skin, get expert
          recommendations, and take care of your beauty.
        </p>
        
        {/* Icons for better visual appeal */}
        <div className="features">
          <div className="feature">
            <FaLeaf className="icon" />
            <p>Natural Care</p>
          </div>
          <div className="feature">
            <FaFlask className="icon" />
            <p>Scientific Analysis</p>
          </div>
          <div className="feature">
            <FaSpa className="icon" />
            <p>Personalized Routine</p>
          </div>
        </div>

        <button onClick={handleGetStarted} className="get-started-button">
          Get Started
        </button>
      </div>

      {/* About Us Section */}
      <div className="about-us">
        <h2>About Us</h2>
        <p>
          At <span className="highlight">MediFaceCare</span>, we are passionate about helping you achieve healthy, glowing skin.
          Our advanced technology and expert advice provide you with tailored skincare solutions.
        </p>
        <p>
          Whether you're looking for a daily routine or specialized treatments, our platform guides you every step of the way.
        </p>
      </div>
    </div>
  );
}

export default StartPage;
