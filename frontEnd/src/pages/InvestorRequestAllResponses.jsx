import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/investor-request-all-responses.css";

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

  if (loading) return <div className="resp-loading">Loading pitches...</div>;

  return (
    <div className="resp-container">
      <div className="resp-header">
        <h2>Response Pitches for Request <span>#{id}</span></h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {pitches.length > 0 ? (
        <div className="resp-grid">
          {pitches.map((p) => (
            <div key={p.id} className="resp-card">
              <div className="resp-card-header">
                <h3>{p.title}</h3>
                <span className="resp-badge">{p.stage}</span>
              </div>
              <p className="resp-desc">{p.description}</p>
              <div className="resp-meta">
                <p><strong>Industry:</strong> {p.industry}</p>
                <p><strong>Amount Needed:</strong> ${p.amount_needed}</p>
                <p><strong>Entrepreneur:</strong> {p.name} ({p.email})</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/pitches/${p.id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="resp-empty">No pitches yet for this request.</p>
      )}

      <ToastContainer />
    </div>
  );
};

export default InvestorRequestsAllResponses;
