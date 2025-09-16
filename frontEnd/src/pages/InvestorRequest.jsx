import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/investor-request.css";

const InvestorRequests = () => {
  console.log("\n\n----------------- Investor Requests Page --------------------");

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const [isInvestor, setIsInvestor] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if current user is an investor
  useEffect(() => {
    const checkInvestorStatus = async () => {
      if (!user) {
        console.log("No user logged in.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      console.log("Checking investor status for user:", user);
      console.log("User token:", token);

      try {
        const endpoint = `${API_BASE}/investor-info/${user.id}`;
        console.log("API Request URL:", endpoint);

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Investor status data:", data);
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

    checkInvestorStatus();

    const fetchRequests = async () => {
      console.log("Fetching all investor requests...");
      try {
        const endpoint = `${API_BASE}/investor-request`;
        console.log("API Request URL:", endpoint);

        const res = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
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

    fetchRequests();
  }, [user]);

  if (loading) {
    console.log("Loading state active...");
    return <div>Loading...</div>;
  }

  // Split requests into my requests vs other requests
  const myRequests = user
    ? requests.filter((r) => r.investorId === user.id)
    : [];
  const otherRequests = user
    ? requests.filter((r) => r.investorId !== user.id)
    : requests;

  console.log("My Requests:", myRequests);
  console.log("Other Requests:", otherRequests);

  return (
    <div>
      <h2>Investor Requests</h2>

      {/* Create new request button for investors */}
      {isInvestor && (
        <button
          onClick={() => {
            console.log("Navigating to: /investor-request/create-new-request");
            navigate("/investor-request/create-new-request");
          }}
          className="btn btn-primary"
        >
          Create New Request
        </button>
      )}

      {/* My Requests Section */}
      {myRequests.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>My Requests</h3>
          {myRequests.map((r) => (
            <div key={r.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
              <p><strong>Title:</strong> {r.title}</p>
              <p><strong>Description:</strong> {r.description}</p>
              <p><strong>Category:</strong> {r.category}</p>
              <p><strong>Investment Range:</strong> ${r.minInvestment} - ${r.maxInvestment}</p>
              <button
                onClick={() => {
                  console.log("Editing request ID:", r.id);
                  navigate(`/investor-request/edit-request/${r.id}`);
                }}
              >
                Edit Request
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Other Requests Section */}
      {otherRequests.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Other Investors' Requests</h3>
          {otherRequests.map((r) => (
            <div key={r.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
              <p><strong>Title:</strong> {r.title}</p>
              <p><strong>Description:</strong> {r.description}</p>
              <p><strong>Category:</strong> {r.category}</p>
              <p><strong>Investment Range:</strong> ${r.minInvestment} - ${r.maxInvestment}</p>
              <button
                onClick={() => {
                  console.log("Responding to request ID:", r.id);
                  navigate(`/investor-request/create-response-pitch/${r.id}`);
                }}
              >
                Respond to Request
              </button>
            </div>
          ))}
        </div>
      )}

      {/* No requests message */}
      {myRequests.length === 0 && otherRequests.length === 0 && (
        <p>No investor requests available.</p>
      )}
    </div>
  );
};

export default InvestorRequests;
