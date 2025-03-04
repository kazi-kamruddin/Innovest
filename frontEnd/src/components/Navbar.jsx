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
            <Link to="/all-pitches">Invest</Link>
            <a href="#">Fundraise</a>
            <a href="#">Help</a>
            <a href="#">Contact</a>
          </li>
        </ul>
        <div className="auth-links">
          {/* <Link to="/login">Login</Link>
          <Link to="/signup">Sign-Up</Link>
          <Link to="/dashboard">Dashboard</Link> */}
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/signup">Sign-Up</Link>}
          {user && <Link to="/dashboard">Dashboard</Link>}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
