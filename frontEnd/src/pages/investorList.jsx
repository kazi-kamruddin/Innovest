import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '../styles/investor-list.css';

const InvestorList = () => {
    const [investors, setInvestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      fetch("http://127.0.0.1:8000/api/investor-list")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch investors");
          }
          return response.json();
        })
        .then((data) => {
          setInvestors(data);
          console.log(data);    
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching investors:", error);
          setError(error.message);
          setLoading(false);
        });
    }, []);
  
    return (
      <div className="investor-list-container">
        <h2 className="">Investor List</h2>
        {loading ? (
          <p className="investor-list-loading">Loading...</p>
        ) : error ? (
          <p className="investor-list-loading">Error: {error}</p>
        ) : investors.length > 0 ? (
          <div className="investor-grid">
            {investors.map((investor) => (
              <div key={investor.id} className="investor-item">
                <div className="investor-header">
                  <h3>{investor.user.name}</h3>
                </div>
                <div className="investor-body">
                  <p><strong>Investment Range:</strong> ${investor.investment_range_min} - ${investor.investment_range_max}</p>
                  <p><strong>Fields of Interest:</strong> {investor.fields_of_interest || 'Not specified'}</p>
                  <p><strong>Preferred Industries:</strong> {investor.preferred_industries || 'Not specified'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No investors found.</p>
        )}
        <ToastContainer position="top-right" autoClose={2300} hideProgressBar={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
    );
  };

export default InvestorList;
