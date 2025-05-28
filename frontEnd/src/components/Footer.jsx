import React from "react";
import { Link } from "react-router-dom"; 
import "../styles/footer.css";
import '../pages/AboutUs.jsx';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Innovest</h3>
          <p>Copyright © 2020 Landify UI Kit.<br />All rights reserved</p>
          {/* <div className="social-icons">
            <img src="src/images/footer.jpeg" alt="Facebook" />
            <img src="src/images/footer2.jpeg" alt="Instagram" />
            <img src="src/images/footer3.jpeg" alt="Twitter" />
          </div> */}
        </div>
        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li><Link to="/about-us">About us</Link></li> 
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact us</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Support</h3>
          <ul>
            <li><a href="#">Help center</a></li>
            <li><a href="#">Terms of service</a></li>
            <li><a href="#">Privacy policy</a></li>    
          </ul>
        </div>
        <div className="footer-section">
          <h3>Stay up to date</h3>
          <form className="newsletter">
            <input type="email" placeholder="Your email address" />
            <button type="submit">→</button>
          </form>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
