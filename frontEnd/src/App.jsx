import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

import LandingPage from "./pages/LandingPage";
import AboutUs from "./pages/AboutUs.jsx";
import Messages from "./pages/Messages.jsx";

import RegSignUp from "./pages/RegSignUp.jsx";
import RegLogin from "./pages/RegLogin.jsx";

import Profile from "./pages/Profile.jsx";
import ProfileEdit from "./pages/ProfileEdit.jsx";
import ProfileOthers from "./pages/ProfileOthers";
import ProfileInvestorInfo from "./pages/ProfileInvestorInfo.jsx";

import Help from "./pages/Help.jsx";

import FundDash from "./pages/FundDash";
import FundDashCreatePitch from "./pages/FundDashCreatePitch";
import InvestorList from "./pages/InvestorList.jsx";
import FundDashEditPitch from "./pages/FundDashEditPitch.jsx";

import PitchAll from "./pages/PitchAll";
import PitchSingle from './pages/PitchSingle';

import InvestorRequest from "./pages/InvestorRequest.jsx";
import InvestorRequestCreate from "./pages/InvestorRequestCreate.jsx";
import EditInvestorRequest from "./pages/InvestorRequestEdit.jsx";
import InvestorRequestResponse from "./pages/InvestorRequestResponse.jsx";
import InvestorRequestClosed from "./pages/InvestorRequestClosed.jsx";
import InvestorRequestsAllResponses from "./pages/InvestorRequestAllResponses.jsx";


import Navbar from "./components/Navbar";  
import Footer from "./components/Footer"; 
import ScrollToTop from "./components/ScrollToTop.jsx";
import "./App.css";



function App() {
    
  const { user } = useAuthContext();

  return (
    <>
      <Navbar /> 
      <ScrollToTop />
      
      <div className="main-section">
        <Routes >
          <Route path="/" element={<LandingPage />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/messages" element={<Messages />} /> 

          <Route path="/login" element={!user ? <RegLogin /> : <Navigate to={"/"} />} />
          <Route path="/signup" element={!user ? <RegSignUp /> : <Navigate to={"/"} />} />

          <Route path="/profile" element={user ? <Profile /> : <Navigate to={"/login"} />} />
          <Route path="/profile/edit-profile" element={user?<ProfileEdit /> : <Navigate to={"/login"}/>} />
          <Route path="/profile/:userId" element={<ProfileOthers />} />
          <Route path="/profile/investor-info" element={<ProfileInvestorInfo />} />
          
          <Route path="/fundraise-dashboard" element={<FundDash />} />
          <Route path="/fundraise-dashboard/create-pitch" element={<FundDashCreatePitch />} />
          <Route path="/fundraise-dashboard/edit-pitch/:id" element={<FundDashEditPitch />} />
          <Route path="/investor-list" element={<InvestorList />} />

          <Route path="/investor-request" element={<InvestorRequest />} />
          <Route path="/investor-request/create-new-request" element={<InvestorRequestCreate />} />
          <Route path="/investor-request/edit-request/:id" element={<EditInvestorRequest />} />
          <Route path="/investor-request/create-response-pitch/:id" element={<InvestorRequestResponse />} />
          <Route path="investor-request/my-closed-requests" element={<InvestorRequestClosed />} />
          <Route path="/investor-request/:id/response-pitches" element={<InvestorRequestsAllResponses />} />

          <Route path="/pitches" element={<PitchAll />} />
          <Route path="/pitches/:id" element={<PitchSingle />} />         
        </Routes> 
      </div> 
      
      <Footer />
    </>
  );
}

export default App;
