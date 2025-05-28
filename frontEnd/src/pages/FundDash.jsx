import React, { useEffect, useState } from "react"; 
import { useAuthContext } from "../hooks/useAuthContext"; 
import { Link } from "react-router-dom";
import "../styles/fund-dash.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FundDash = () => {
  const { user } = useAuthContext(); 
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pitchToDelete, setPitchToDelete] = useState(null);

  useEffect(() => {
    console.log("User AuthContext:", user);

    if (!user || !user.id) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const endpoint = `http://127.0.0.1:8000/api/users/${user.id}/pitches`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    };

    console.log("Fetching pitches");
    console.log("Endpoint:", endpoint);
    console.log("Method: GET");
    console.log("Headers:", headers);

    fetch(endpoint, { headers })
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

  const deletePitch = async (id) => {
    const token = localStorage.getItem("token");

    console.log("Deleting pitch");
    console.log("Endpoint:", `http://127.0.0.1:8000/api/users/${user.id}/pitches/${id}`);
    console.log("Method: DELETE");
    console.log("Headers:", {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    });

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${user.id}/pitches/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (!response.ok) {
        console.warn("Error deleting pitch:", data.error);
        toast.error(data.error || "Error deleting pitch");
        return;
      }

      setPitches(pitches.filter((pitch) => pitch.id !== id));
      toast.success("Pitch deleted successfully");
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Something went wrong");
    }
  };


  const handleDeleteClick = (pitch) => {
    setPitchToDelete(pitch);
    setShowConfirmModal(true);
  };

  return (
    <div className="fundraise-dashboard-container">
      <div className="fundraise-box-container">

        <div className="fundraise-box add-fundraise">
          <Link to="/fundraise-dashboard/create-pitch">
            <button className="add-fundraise-button">
              <span className="plus-sign">+</span>
            </button>
          </Link>

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
                {/* Edit button */}
                <Link to={`/fundraise-dashboard/edit-pitch/${pitch.id}`}>
                  <button className="edit-fundraise-btn" style={{ marginRight: "10px" }}>
                    ✏️ Edit
                  </button>
                </Link>

                {/* Delete button */}
                <button
                  className="delete-fundraise-btn"
                  onClick={() => handleDeleteClick(pitch)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No pitches found.</p>
        )}
      </div>

      <div className="fundraise-bottom">
        <Link to="/investor-list">
          <button className="fundraise-pitch-button">Explore Investor List</button>
        </Link>
      </div>

      {showConfirmModal && pitchToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>
              Are you sure you want to delete the pitch:{" "}
              <strong>{pitchToDelete.title}</strong>?
            </p>
            <div className="modal-buttons">
              <button
                className="confirm-btn"
                onClick={() => {
                  deletePitch(pitchToDelete.id);
                  setShowConfirmModal(false);
                  setPitchToDelete(null);
                }}
              >
                Yes
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPitchToDelete(null);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
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

export default FundDash;
