import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/investor-request-create.css";

const EditInvestorRequest = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams(); 
  const API_BASE = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    minInvestment: "",
    maxInvestment: "",
  });

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const categoryOptions = [
    "Technology", "Healthcare", "Finance", "Real Estate", "Education", "Food & Beverage", "Other"
  ];

  console.log("\n\n----------------- Edit Request Page --------------------");

  // Fetch existing request data
  useEffect(() => {
    if (!id) return;

    const fetchRequest = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE}/investor-request/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch request");

        const data = await res.json();
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          minInvestment: data.minInvestment || "",
          maxInvestment: data.maxInvestment || "",
        });
        console.log(data);
      } catch (err) {
        console.error("Error fetching request:", err);
        toast.error("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

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

    const endpoint = `${API_BASE}/investor-request/edit-request/${id}`;
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      minInvestment: formData.minInvestment,
      maxInvestment: formData.maxInvestment,
    };

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update request");
      }

      toast.success("Request updated successfully!");
      setTimeout(() => navigate("/investor-request"), 1000);
    } catch (err) {
      console.error("Error updating request:", err);
      toast.error(err.message || "Update failed");
    }
  };

  const cancelSubmit = () => setShowModal(false);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="investment-pitches">
      <h2 className="text-center mb-4">Edit Investor Request</h2>

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
          Update Request
        </button>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Are you sure you want to update this request?</h5>
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

export default EditInvestorRequest;
