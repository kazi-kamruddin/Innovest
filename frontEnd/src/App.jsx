import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const AboutUs = lazy(() => import("./pages/aboutUs.jsx"));
const Messages = lazy(() => import("./pages/Messages.jsx"));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));

const RegSignUp = lazy(() => import("./pages/RegSignUp.jsx"));
const RegLogin = lazy(() => import("./pages/RegLogin.jsx"));
const ForgotPassword = lazy(() => import("./pages/AccountActions.jsx").then((m) => ({ default: m.ForgotPassword })));
const CheckEmail = lazy(() => import("./pages/AccountActions.jsx").then((m) => ({ default: m.CheckEmail })));
const VerifyEmail = lazy(() => import("./pages/AccountActions.jsx").then((m) => ({ default: m.VerifyEmail })));
const ResetPassword = lazy(() => import("./pages/AccountActions.jsx").then((m) => ({ default: m.ResetPassword })));

const Profile = lazy(() => import("./pages/Profile.jsx"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit.jsx"));
const ProfileOthers = lazy(() => import("./pages/ProfileOthers"));
const ProfileInvestorInfo = lazy(() => import("./pages/ProfileInvestorInfo.jsx"));

const Help = lazy(() => import("./pages/Help.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));

const FundDash = lazy(() => import("./pages/FundDash"));
const FundDashCreatePitch = lazy(() => import("./pages/FundDashCreatePitch"));
const InvestorList = lazy(() => import("./pages/investorList.jsx"));
const FundDashEditPitch = lazy(() => import("./pages/FundDashEditPitch.jsx"));

const PitchAll = lazy(() => import("./pages/PitchAll"));
const PitchSingle = lazy(() => import('./pages/PitchSingle'));

const InvestorRequest = lazy(() => import("./pages/InvestorRequest.jsx"));
const InvestorRequestCreate = lazy(() => import("./pages/InvestorRequestCreate.jsx"));
const EditInvestorRequest = lazy(() => import("./pages/InvestorRequestEdit.jsx"));
const InvestorRequestResponse = lazy(() => import("./pages/InvestorRequestResponse.jsx"));
const InvestorRequestClosed = lazy(() => import("./pages/InvestorRequestClosed.jsx"));
const InvestorRequestsAllResponses = lazy(() => import("./pages/InvestorRequestAllResponses.jsx"));

import Navbar from "./components/Navbar";  
import Footer from "./components/Footer"; 
import ScrollToTop from "./components/ScrollToTop.jsx";
import "./App.css";

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] items-center justify-center p-8"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#345C3D]/20 border-t-[#345C3D]"
        aria-hidden="true"
      />
      <span className="sr-only">Loading page...</span>
    </div>
  );
}

function App() {
  const { user } = useAuthContext();
  const location = useLocation();

  return (
    <>
      <Navbar /> 
      
      <ScrollToTop />

      <div className="main-section">
        <Suspense fallback={<PageLoader />}>
          <Routes >
            <Route path="/" element={<LandingPage />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/messages" element={user ? <Messages /> : <Navigate to="/login" state={{ from: location }} replace />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" state={{ from: location }} replace />} />

            <Route path="/login" element={!user ? <RegLogin /> : <Navigate to={"/"} />} />
            <Route path="/signup" element={!user ? <RegSignUp /> : <Navigate to={"/"} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" state={{ from: location }} replace />} />
            <Route path="/profile/edit-profile" element={user ? <ProfileEdit /> : <Navigate to="/login" state={{ from: location }} replace />} />
            <Route path="/profile/:userId" element={<ProfileOthers />} />
            <Route path="/profile/investor-info" element={user ? <ProfileInvestorInfo /> : <Navigate to="/login" state={{ from: location }} replace />} />
            
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
        </Suspense>
      </div> 
      
      <Footer />
    </>
  );
}

export default App;
