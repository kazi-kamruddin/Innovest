import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Innovest</Link> 
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
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign-Up</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
