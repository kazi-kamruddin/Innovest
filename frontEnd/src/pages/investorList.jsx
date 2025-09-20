import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuthContext } from "../hooks/useAuthContext"; 
import '../styles/investor-list.css';

const InvestorList = () => {
  const { user } = useAuthContext(); 
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL;
  const navigate = useNavigate(); 

  useEffect(() => {
    fetch(`${API_BASE}/investor-info/investor-list`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch investors");
        return response.json();
      })
      .then((data) => {
        const filtered = data.filter(investor => investor.user_id !== user?.id);
        setInvestors(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching investors:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [API_BASE, user?.id]);

  return (
    <div className="investor-list-container">
      <h2>Investor List</h2>
      {loading ? (
        <p className="investor-list-loading">Loading...</p>
      ) : error ? (
        <p className="investor-list-loading">Error: {error}</p>
      ) : investors.length > 0 ? (
        <div className="investor-grid">
          {investors.map((investor) => (
            <div
              key={investor.id}
              className="investor-item"
              onClick={() => navigate(`/profile/${investor.user_id || investor.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="investor-header">
                <h3>{investor.name}</h3>
              </div>
              <div className="investor-body">
                <p>
                  <strong>Investment Range:</strong> ${investor.investment_range_min} - ${investor.investment_range_max}
                </p>
                <p>
                  <strong>Fields of Interest:</strong> {investor.fields_of_interest || 'Not specified'}
                </p>
                <p>
                  <strong>Preferred Industries:</strong> {investor.preferred_industries || 'Not specified'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No investors found.</p>
      )}
      <ToastContainer 
        position="top-right" 
        autoClose={2300} 
        hideProgressBar={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </div>
  );
};

export default InvestorList;
