import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useParams,useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/fund-dash-create-pitch.css";

const FundDashEditPitch = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    title: "",
    company_location: "",
    country: "",
    cell_number: "",
    industry: "",
    stage: "",
    ideal_investor_role: "",
    total_raising_amount: "",
    minimum_investment: "",
    the_business: "",
    the_market: "",
    progress: "",
    objective: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const industryOptions = [
    "Technology", "Healthcare", "Finance", "Real Estate", "Retail",
    "Manufacturing", "Education", "Food & Beverage", "Automotive", "Other"
  ];
  const stageOptions = [
    "Idea", "Prototype", "Early Revenue", "Scaling", "Profitable"
  ];
  const investorRoleOptions = [
    "Silent Investor", "Active Partner", "Advisor", "Board Member"
  ];

  useEffect(() => {
    fetch(`${API_BASE}/pitches/${id}`)
      .then((response) => {
        console.log("GET /api/pitches/" + id, response);
        if (!response.ok) throw new Error("Failed to fetch pitch data");
        return response.json();
      })
      .then((data) => {
        setFormData({
          title: data.title || "",
          company_location: data.company_location || "",
          country: data.country || "",
          cell_number: data.cell_number || "",
          industry: data.industry || "",
          stage: data.stage || "",
          ideal_investor_role: data.ideal_investor_role || "",
          total_raising_amount: data.total_raising_amount || "",
          minimum_investment: data.minimum_investment || "",
          the_business: data.the_business || "",
          the_market: data.the_market || "",
          progress: data.progress || "",
          objective: data.objective || "",
        });
      })
      .catch((error) => {
        console.error("Error fetching pitch:", error);
        toast.error("Failed to load pitch details.");
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true); 
  };

  const confirmUpdate = () => {
    setShowModal(false);

    const token = localStorage.getItem("token");
    const userId = user.id;

    if (!token || !userId) {
        toast.error("You are not authorized. Please log in again.");
        return;
    }

    console.log("PUT /api/users/" + userId + "/pitches/" + id);
    console.log("Payload:", formData);

    fetch(`${API_BASE}/pitches/users/${userId}/pitches/${id}`, {
        method: "PUT",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    })
        .then((res) => {
        console.log("Response:", res);
        if (!res.ok) {
            return res.json().then((err) => {
            throw new Error(err?.error || "Failed to update pitch");
            });
        }
        return res.json();
        })
        .then((data) => {
        toast.success("Pitch updated successfully!");
        setTimeout(() => navigate("/fundraise-dashboard"), 1500);
        })
        .catch((error) => {
        toast.error(error.message || "Update failed.");
        });
  };


  const cancelUpdate = () => {
    setShowModal(false);
  };

  return (
    <div className="investment-pitches">
      <h2 className="text-center mb-4">Pitch Editor</h2>
      <form className="p-4 border rounded shadow" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Pitch Title</label>
          <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Company Location</label>
            <input type="text" name="company_location" className="form-control" value={formData.company_location} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Country</label>
            <input type="text" name="country" className="form-control" value={formData.country} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Cell Number</label>
          <input type="text" name="cell_number" className="form-control" value={formData.cell_number} onChange={handleChange} />
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Industry</label>
            <select name="industry" className="form-control" value={formData.industry} onChange={handleChange} required>
              <option value="">Select Industry</option>
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Stage</label>
            <select name="stage" className="form-control" value={formData.stage} onChange={handleChange}>
              <option value="">Select Stage</option>
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Ideal Investor Role</label>
            <select name="ideal_investor_role" className="form-control" value={formData.ideal_investor_role} onChange={handleChange}>
              <option value="">Select Role</option>
              {investorRoleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Total Raising Amount</label>
            <input type="number" name="total_raising_amount" className="form-control" value={formData.total_raising_amount} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Minimum Investment</label>
            <input type="number" name="minimum_investment" className="form-control" value={formData.minimum_investment} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">The Business</label>
          <textarea name="the_business" className="form-control" rows="3" value={formData.the_business} onChange={handleChange}></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">The Market</label>
          <textarea name="the_market" className="form-control" rows="3" value={formData.the_market} onChange={handleChange}></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Progress</label>
          <textarea name="progress" className="form-control" rows="3" value={formData.progress} onChange={handleChange}></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Objective</label>
          <textarea name="objective" className="form-control" rows="3" value={formData.objective} onChange={handleChange}></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Update Pitch
        </button>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Are you sure you want to update this pitch?</h5>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmUpdate}>
                Yes, Update
              </button>
              <button className="cancel-btn" onClick={cancelUpdate}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
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

export default FundDashEditPitch;
