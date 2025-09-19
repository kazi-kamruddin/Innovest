import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/navbar.css";
import { useAuthContext } from "../hooks/useAuthContext";

function Navbar() {
  const { user } = useAuthContext();

  return (
    <nav className="navbar">
      <div className="logo">
        <NavLink to="/" className="logo-link">
          Innovest
        </NavLink>
      </div>

      <div className="nav-container">
        <ul className="nav-links">
          <li>
            <NavLink to="/pitches" className={({ isActive }) => (isActive ? "active" : "")}>
              Invest
            </NavLink>
            <NavLink to="/fundraise-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              Fundraise
            </NavLink>
            <NavLink to="/investor-request" className={({ isActive }) => (isActive ? "active" : "")}>
              Investors' Requests
            </NavLink>
            <NavLink to="/messages" className={({ isActive }) => (isActive ? "active" : "")}>
              Messages
            </NavLink>
            <NavLink to="/about-us" className={({ isActive }) => (isActive ? "active" : "")}>
              About Us
            </NavLink>
          </li>
        </ul>

        <div className="auth-links">
          {!user && (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                Login
              </NavLink>
              <NavLink to="/signup" className={({ isActive }) => (isActive ? "active" : "")}>
                Sign-Up
              </NavLink>
            </>
          )}
          {user && (
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
