import { useState } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import Login from './pages/login.jsx';

import LandingPage from './pages/landing_Page.jsx';


import InvestorProfile from './pages/investorProfile.jsx';


const App = () => {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/investor-profile" element={<InvestorProfile />} /> 
      </Routes>
    </>
  );
};

export default App;
