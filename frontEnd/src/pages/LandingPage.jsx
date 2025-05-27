import React from 'react';
import { Link } from "react-router-dom";
import '../styles/landing-page.css';


function LandingPage() {
  return (
    <>
      {/* Banner */}
      <div className="hero">
        <div className="hero-content">
          <h1>Connecting Investors and Innovation together here in Innovest</h1>
          <p>Where great businesses and great people meet. We bring together businesses looking for investment and investors with capital,contacts and knowledge to help them succeed.</p>
          <div className="hero-buttons">
          <Link to="/fundraise-dashboard">
            <button className="btn secondary">Get Started →</button>
          </Link>
          
          </div>
        </div>
        <div className="hero-image">
          <img src="src/images/first.png" alt="Hero Section Image" />
        </div>
      </div>
      
      {/* <!-- investment Future --> */}
    <div className="future">
        <section className="blockchain-section">
          <h1>Innovest: The Foundation of the Future</h1>
          <p>
          Innovest is more than just a platform—it's the foundation where groundbreaking ideas transform into successful ventures.<br/> By bridging the gap between ambitious entrepreneurs and visionary investors, we create an ecosystem where innovation thrives and opportunities flourish.
          </p>
          <div className="future-container">
            <div className="future-card">
              <div className="image-container">
                <img src="src/images/future1.jpeg" alt="Image 1" className="image-placeholder"/>
              </div>
              <div className="description-container">
                <p className="description">
                Empowering businesses to grow, expand, and thrive globally.
                </p>
              </div>
            </div>
            <div className="future-card">
              <div className="image-container">
                <img src="src/images/future2.jpeg" alt="Image 2" className="image-placeholder"/>
              </div>
              <div className="description-container">
                <p className="description">
                A thriving network of entrepreneurs, investors, and industry leaders.
                </p>            
              </div>
            </div>
            <div className="future-card">
              <div className="image-container">
                <img src="src/images/future3.jpeg" alt="Image 3" className="image-placeholder"/>
              </div>
              <div className="description-container">
                <p className="description">
                Connecting startups with capital, mentorship, and opportunities.
                </p>      
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* <!-- Our clients --> */}
    <div className="client">
        <div className="client-content">
            <h2>Our Clients</h2>
            <p>We have been working with some Fortune 300+ clients</p>
        </div>
        <div className="client-logos">
            <img src="src/images/logo1.jpg" alt="Client Logo 1" />
            <img src="src/images/logo2.jpeg" alt="Client Logo 2" />
            <img src="src/images/logo3.jpg" alt="Client Logo 3" />
            <img src="src/images/logo4.jpeg" alt="Client Logo 4" />
            <img src="src/images/logo5.jpeg" alt="Client Logo 5" />
        </div>
    </div>
    
    {/* <!-- power of investment --> */}
     <div className="power">
    <div className="power-content">
        <div className="header">Explore the Power of Investment</div>
        <div className="sub-header">Who can benefit from investment?</div>

        <div className="cards">
            <div className="card">
                <img src="src/images/power1.jpg" alt="power logo 1" />
                <div className="card-title">Creator Communities</div>
                <div className="card-text">Support creators with multiple marketplaces and direct engagement with their audience.</div>
            </div>

            <div className="card">
                <img src="src/images/power2.jpeg" alt="power logo 2" />
                <div className="card-title">Financial Institutions</div>
                <div className="card-text">technology enables secure,fast and advanced financial transactions.</div>
            </div>

            <div className="card">
                <img src="src/images/power3.jpg" alt="power logo 3" />
                <div className="card-title">Supply Chain Management</div>
                <div className="card-text">Enhance traceability, transparency, and operational efficiency across global supply chains.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
