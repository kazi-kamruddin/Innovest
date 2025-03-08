import React, { useEffect, useState } from "react"; 
import { useAuthContext } from "../hooks/useAuthContext"; 
import "../styles/FundraiseDashboard.css";

const FundraiseDashboard = () => {
  const { user } = useAuthContext(); 
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("User AuthContext:", user);

    if (!user || !user.id) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    fetch(`http://127.0.0.1:8000/api/users/${user.id}/pitches`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`, 
        },
    })
    
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch pitches");
        }
        return response.json();
      })
      .then((data) => {
        setPitches(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching pitches:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="fundraise-dashboard-container">
      <div className="fundraise-box-container">
 
        <div className="fundraise-box add-fundraise">
          <button className="add-fundraise-button">
            <span className="plus-sign">+</span>
          </button>
          <p className="hit">Hit the big blue button to add a new pitch.</p>
        </div>


        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : pitches.length > 0 ? (
          pitches.map((pitch) => (
            <div key={pitch.id} className="fundraise-box existing-fundraise">
              <div className="fundraise-body">
                <h3>{pitch.title}</h3>
                <p className="location">📍 {pitch.company_location}, {pitch.country}</p>
                <p><strong>Market:</strong> {pitch.the_market}</p>
                <ul>
                  <li><strong>Industry:</strong> {pitch.industry}</li>
                  <li><strong>Contact:</strong> 📞 {pitch.cell_number}</li>
                </ul>
                <div className="funding-info">
                  <span><strong>Raising Amount:</strong> ${pitch.total_raising_amount}</span>
                  <span><strong>Minimum Investment:</strong> ${pitch.minimum_investment}</span>
                </div>
              </div>

              <div className="fundraise-footer">
                <button className="manage-fundraise-btn">Manage my Pitch</button>
                <button className="delete-fundraise-btn">🗑</button>
              </div>
            </div>
          ))
        ) : (
          <p>No pitches found.</p>
        )}
      </div>

      <div className="fundraise-bottom">
        <button className="fundraise-pitch-button">Explore Investor List</button>
      </div>
    </div>
  );
};

export default FundraiseDashboard;
