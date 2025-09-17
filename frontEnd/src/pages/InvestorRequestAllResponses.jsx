import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InvestorRequestsAllResponses = () => {
  const { id } = useParams(); 
  const API_BASE = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPitches = async () => {
      try {
        const res = await fetch(`${API_BASE}/investor-request/${id}/pitches`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setPitches(data);
        } else {
          console.error("Failed to fetch pitches");
        }
      } catch (err) {
        console.error("Error fetching pitches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPitches();
  }, [id, API_BASE]);

  if (loading) return <p>Loading pitches...</p>;

  return (
    <div>
      <h2>Response Pitches for Request #{id}</h2>

      {pitches.length > 0 ? (
        pitches.map((p) => (
          <div key={p.id} className="pitch-card" style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p><strong>Industry:</strong> {p.industry}</p>
            <p><strong>Stage:</strong> {p.stage}</p>
            <p><strong>Amount Needed:</strong> ${p.amount_needed}</p>
            <p><strong>Entrepreneur:</strong> {p.name} ({p.email})</p>
            
            <button 
              style={{ marginTop: "10px" }}
              onClick={() => navigate(`/pitches/${p.id}`)}
            >
              View Details
            </button>
          </div>
        ))
      ) : (
        <p>No pitches yet for this request.</p>
      )}

      <button style={{ marginTop: "20px" }} onClick={() => navigate(-1)}>Back</button>
      <ToastContainer />
    </div>
  );
};

export default InvestorRequestsAllResponses;
