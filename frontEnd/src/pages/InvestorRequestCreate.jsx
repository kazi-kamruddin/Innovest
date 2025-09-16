import React, { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/investor-request-create.css"; 

const CreateInvestorRequest = () => {
  console.log("\n\n----------------- Create Investor Request Page --------------------");

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    minInvestment: "",
    maxInvestment: "",
  });

  const [showModal, setShowModal] = useState(false);

  const categoryOptions = [
    "Technology", "Healthcare", "Finance", "Real Estate", "Education", "Food & Beverage", "Other"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    setShowModal(false);

    const token = localStorage.getItem("token");
    if (!token || !user) {
      toast.error("You are not authorized. Please log in again.");
      return;
    }

    const endpoint = `${API_BASE}/investor-request/create-new-request`;

    const payload = {
      investorId: user.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      minInvestment: formData.minInvestment,
      maxInvestment: formData.maxInvestment,
    };

    console.log(`POST ${endpoint}`);
    console.log("Payload:", payload);
    console.log("User token:", token);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create request");
      }

      const result = await res.json();
      console.log("API response:", result);
      toast.success("Investor request created successfully!");
      setTimeout(() => navigate("/investor-request"), 1000);
    } catch (err) {
      console.error("Error creating request:", err);
      toast.error(err.message || "Creation failed");
    }
  };

  const cancelSubmit = () => setShowModal(false);

  return (
    <div className="investment-pitches">
      <h2 className="text-center mb-4">Create Investor Request</h2>

      <form className="p-4 border rounded shadow" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Minimum Investment</label>
            <input
              type="number"
              name="minInvestment"
              className="form-control"
              value={formData.minInvestment}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Maximum Investment</label>
            <input
              type="number"
              name="maxInvestment"
              className="form-control"
              value={formData.maxInvestment}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Create Request
        </button>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Are you sure you want to create this request?</h5>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmSubmit}>
                Yes
              </button>
              <button className="cancel-btn" onClick={cancelSubmit}>
                No
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
        pauseOnHover
      />
    </div>
  );
};

export default CreateInvestorRequest;
