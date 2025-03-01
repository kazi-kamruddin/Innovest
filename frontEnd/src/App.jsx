import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

import SignUp from "./pages/signUp";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/landing_Page";
import InvestorProfile from "./pages/InvestorProfile";
import PitchesPage from "./components/PitchList";
import PitchForm from "./components/PitchForm";

import Navbar from "./components/Navbar";  
import Footer from "./components/Footer"; 
import "./App.css";

function App() {
  const { user } = useAuthContext();

  return (
    <>
      <Navbar /> 

      <div className="main-section">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
          <Route path="/investor-profile" element={<InvestorProfile />} />

          {/* Protected Routes (Require Login) */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/pitches" element={user ? <PitchesPage /> : <Navigate to="/login" />} /> 
          <Route path="/add-pitch" element={<PitchForm /> } /> 
        </Routes> 
      </div> 
      
      <Footer />
    </>
  );
}

export default App;
