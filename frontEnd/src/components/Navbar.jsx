import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import { useAuthContext } from "../hooks/useAuthContext";

function Navbar() {
  const { user } = useAuthContext();

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Innovest</Link> 
      </div>
      <div className="nav-container">
        <ul className="nav-links">
          <li>
            <Link to="/pitches">Invest</Link>
            <Link to="/fundraise-dashboard">Fundraise</Link> 
            {/* <a href="#">Help</a> */}
            <Link to="/messages">Messages</Link>
            <Link to="/about-us">About Us</Link>
          </li>
        </ul>
        <div className="auth-links">
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/signup">Sign-Up</Link>}
          {user && <Link to="/profile">Dashboard</Link>}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
