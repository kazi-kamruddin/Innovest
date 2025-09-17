import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/investor-request-closed.css";

const MyClosedRequests = () => {
  const { user } = useAuthContext();
  const API_BASE = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchClosedRequests = async () => {
      try {
        const res = await fetch(`${API_BASE}/investor-request/my-closed`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        } else {
          console.error("Failed to fetch closed requests. Status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching closed requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedRequests();
  }, [user, API_BASE]);

  const handleReopen = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/investor-request/${selectedRequest.id}/reopen`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to reopen");

      toast.success("Request reopened!");
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id)); 
    } catch (error) {
      console.error("Error reopening request:", error);
      toast.error("Could not reopen request");
    } finally {
      setShowModal(false);
      setSelectedRequest(null);
    }
  };

  if (loading) {
    return <div>Loading closed requests...</div>;
  }

  return (
    <div className="my-closed-requests">
      <h2>My Closed Requests</h2>

      {requests.length > 0 ? (
        requests.map((r) => (
          <div key={r.id} className="closed-request-card">
            <p><strong>Title:</strong> {r.title}</p>
            <p><strong>Description:</strong> {r.description}</p>
            <p><strong>Category:</strong> {r.category}</p>
            <p>
              <strong>Investment Range:</strong> ${r.minInvestment} - ${r.maxInvestment}
            </p>
            <p><strong>Status:</strong> {r.status}</p>

            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedRequest(r);
                setShowModal(true);
              }}
            >
              Reopen
            </button>
          </div>
        ))
      ) : (
        <p>You have no closed requests.</p>
      )}

      <button className="btn btn-secondary" onClick={() => navigate("/investor-request")}>
        Back to All Requests
      </button>

      {/* Confirmation Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>
              Are you sure you want to reopen request "{selectedRequest.title}"?
            </h5>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleReopen}>
                Yes, Reopen
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default MyClosedRequests;
