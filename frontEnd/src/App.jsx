import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext"

import SignUp from "./pages/signUp";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/landing_Page";
import InvestorProfile from "./pages/InvestorProfile";

import Allpitches from "./pages/all_pitches";
import MoreAllPitches from './pages/more_all_pitches'; 
import AboutUs from "./pages/aboutUs";
import CreatePitch from "./pages/CreatePitch";

import Navbar from "./components/Navbar";  
import Footer from "./components/Footer"; 
import ScrollToTop from "./components/ScrollToTop.jsx";
import "./App.css";
import EditProfile from "./pages/edit_profile";

function App() {
    
  const { user } = useAuthContext();

  return (
    <>
      <Navbar /> 
      <ScrollToTop />
      
      <div className="main-section">
        <Routes >
          <Route path="/" element={<LandingPage />} />
          {/* <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} /> */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to={"/"} />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to={"/"} />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to={"/login"} />} />
          <Route path="/investor-profile" element={<InvestorProfile />} /> 
          <Route path="/editProfile" element={<EditProfile />} /> 
          <Route path="/all-pitches" element={<Allpitches />} />
          <Route path="/all-pitches/:id" element={<MoreAllPitches />} /> 
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/create-pitch" element={<CreatePitch />} />
        </Routes> 
      </div> 
      
      <Footer />
    </>
  );
}

export default App;
