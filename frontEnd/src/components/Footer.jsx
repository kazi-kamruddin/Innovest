import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa"; 
import "../styles/footer.css";
import '../pages/AboutUs.jsx';
import '../pages/Help.jsx';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Innovest</h3>
          <p>©2025 All rights reserved.</p>
        </div>

        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li><Link to="/about-us">About us</Link></li> 
            <li><Link to="/privacy">Privacy policy</Link></li>  
          </ul>
        </div>

        <div className="footer-section">
          <h3>Support</h3>
          <ul>
            <li><Link to="/help" >Help Center</Link></li>  
            <li><Link to="/terms">Terms of service</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Our Contact</h3>
          <p className="contact-line">
            <FaMapMarkerAlt className="footer-icon" />
            383/1 Modhubag, Nayatola Police Fari, Tejgaon, Dhaka
          </p>
          <p className="contact-line">
            <FaPhoneAlt className="footer-icon" />
            +880-1537-477400
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
