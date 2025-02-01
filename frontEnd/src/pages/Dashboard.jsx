import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail");

    if (!authToken) {
      alert("Unauthorized! Redirecting to login...");
      navigate("/login");
    } else {
      setEmail(userEmail); 
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="container">
      <h2>Welcome to your Dashboard</h2>
      <p>You are logged in as: <strong>{email}</strong></p>
      <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
