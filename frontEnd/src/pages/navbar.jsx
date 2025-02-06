import React from 'react';
import './navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <a href="#">Innovest</a>
      </div>
      <div className="nav-container">
        <ul className="nav-links">
          <li>
            <a href="#">Invest</a>
            <a href="#">Fundraise</a>
            <a href="#">Help</a>
            <a href="#">Contact</a>
          </li>
        </ul>
        <div className="auth-links">
          <a href="#">Login</a>
          <a href="#">Sign-Up</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
