import { useState } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import Login from './pages/login.jsx';
import LandingPage from './pages/landingPage.jsx';

const App = () => {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/login" element={<Login />} /> 
      </Routes>
    </>
  );
};

export default App;
