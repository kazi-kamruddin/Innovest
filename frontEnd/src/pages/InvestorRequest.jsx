// src/pages/InvestorRequests.jsx
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/investor-request.css";

const InvestorRequests = () => {
  console.log("\n\n----------------- Investor Requests Page --------------------");

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const [isInvestor, setIsInvestor] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const checkInvestorStatus = async () => {
      if (!user) {
        console.log("No user logged in.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      console.log("Checking investor status for user:", user);

      try {
        const endpoint = `${API_BASE}/investor-info/${user.id}`;
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setIsInvestor(true);
          } else {
            console.log("User is NOT an investor.");
          }
        } else {
          console.error("Failed to fetch investor info. Status:", res.status);
        }
      } catch (error) {
        console.error("Error checking investor status:", error);
      }
    };

    const fetchRequests = async () => {
      console.log("Fetching all investor requests...");
      try {
        const endpoint = `${API_BASE}/investor-request`;
        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Fetched requests:", data);
          setRequests(data);
        } else {
          console.error("Failed to fetch investor requests. Status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching investor requests:", error);
      } finally {
        setLoading(false);
      }
    };

    checkInvestorStatus();
    fetchRequests();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const myRequests = user
    ? requests.filter((r) => r.investorId === user.id)
    : [];
  const otherRequests = user
    ? requests.filter((r) => r.investorId !== user.id)
    : requests;


  const handleCloseRequest = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/investor-request/${selectedRequest.id}/close`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to close request");
      }

      toast.success("Request marked as closed!");
      setRequests((prev) =>
        prev.filter((r) => r.id !== selectedRequest.id)
      ); 
    } catch (error) {
      console.error("Error closing request:", error);
      toast.error("Failed to close request.");
    } finally {
      setShowModal(false);
      setSelectedRequest(null);
    }
  };

  return (
    <div>

      {isInvestor && (
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => navigate("/investor-request/create-new-request")}
            className="btn btn-primary"
          >
            Create New Request
          </button>

          <button
            onClick={() => navigate("/investor-request/my-closed-requests")}
            className="btn btn-secondary"
            style={{ marginLeft: "10px" }}
          >
            View Closed Requests
          </button>
        </div>
      )}


      {/* my requests*/}
      {myRequests.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>My Requests</h3>
          {myRequests.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p>
                <strong>Title:</strong> {r.title}
              </p>
              <p>
                <strong>Description:</strong> {r.description}
              </p>
              <p>
                <strong>Category:</strong> {r.category}
              </p>
              <p>
                <strong>Investment Range:</strong> ${r.minInvestment} - ${r.maxInvestment}
              </p>
              <button onClick={() => navigate(`/investor-request/edit-request/${r.id}`)}>
                Edit Request
              </button>
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  setSelectedRequest(r);
                  setShowModal(true);
                }}
              >
                Mark as Closed
              </button>
            </div>
          ))}
        </div>
      )}

      {/* other requests */}
      {otherRequests.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Other Investors' Requests</h3>
          {otherRequests.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p>
                <strong>Title:</strong> {r.title}
              </p>
              <p>
                <strong>Description:</strong> {r.description}
              </p>
              <p>
                <strong>Category:</strong> {r.category}
              </p>
              <p>
                <strong>Investment Range:</strong> ${r.minInvestment} - ${r.maxInvestment}
              </p>
              <button
                onClick={() =>
                  navigate(`/investor-request/create-response-pitch/${r.id}`)
                }
              >
                Respond to Request
              </button>
            </div>
          ))}
        </div>
      )}

      {/* no requests */}
      {myRequests.length === 0 && otherRequests.length === 0 && (
        <p>No investor requests available.</p>
      )}


      {showModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>
              Are you sure you want to mark request "{selectedRequest.title}" as
              closed?
            </h5>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleCloseRequest}>
                Yes, Close
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

export default InvestorRequests;
