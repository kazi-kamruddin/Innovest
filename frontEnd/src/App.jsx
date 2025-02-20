import React from "react";
import { Routes, Route } from "react-router-dom";

import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/landing_Page";
import InvestorProfile from "./pages/InvestorProfile";

import Navbar from "./components/Navbar";  
import Footer from "./components/Footer"; 

import "./App.css";

function App() {
  return (
    <>
      <Navbar /> 

      <div className="main-section">
        <Routes >
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/investor-profile" element={<InvestorProfile />} />
        </Routes> 
      </div> 
      
      <Footer />
    </>
  );
}

export default App;
