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
    "Technology",
    "Healthcare",
    "Finance",
    "Real Estate",
    "Education",
    "Food & Beverage",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // keep numbers non-negative (client hint; server is source of truth)
    if (name === "minInvestment" || name === "maxInvestment") {
      const v = value === "" ? "" : Math.max(0, Number(value || 0));
      setFormData((s) => ({ ...s, [name]: v }));
      return;
    }
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // soft client checks for nicer UX
    if (!formData.title.trim()) return toast.error("Please enter a title.");
    if (!formData.description.trim())
      return toast.error("Please add a short description.");
    if (!formData.category) return toast.error("Please choose a category.");
    if (
      formData.minInvestment !== "" &&
      formData.maxInvestment !== "" &&
      Number(formData.minInvestment) > Number(formData.maxInvestment)
    ) {
      return toast.error("Minimum investment cannot exceed maximum.");
    }

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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create request");
      }

      const result = await res.json().catch(() => ({}));
      console.log("API response:", result);
      toast.success("Investor request created successfully!");
      setTimeout(() => navigate("/investor-request"), 900);
    } catch (err) {
      console.error("Error creating request:", err);
      toast.error(err.message || "Creation failed");
    }
  };

  const cancelSubmit = () => setShowModal(false);

  return (
    <div className="investment-pitches irc-create">
      <div className="irc-header">
        <div>
          <h2 className="irc-title">Create Investor Request</h2>
          <p className="irc-sub">
            Describe what you’re looking to invest in and your preferred range.
          </p>
        </div>

        <div className="irc-actions">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <form className="irc-card" onSubmit={handleSubmit}>
        <fieldset className="irc-group">
          <legend>Details</legend>

          <div className="irc-row">
            <div className="irc-col-full">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Seed funding for AI tutoring platform"
              />
            </div>
          </div>

          <div className="irc-row">
            <div className="irc-col-full">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="What opportunity are you looking for? Any constraints or preferences?"
              />
            </div>
          </div>

          <div className="irc-row">
            <div className="irc-col">
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
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="irc-col">
              <label className="form-label">Minimum Investment</label>
              <input
                type="number"
                min="0"
                name="minInvestment"
                className="form-control"
                value={formData.minInvestment}
                onChange={handleChange}
                placeholder="e.g., 25000"
              />
            </div>

            <div className="irc-col">
              <label className="form-label">Maximum Investment</label>
              <input
                type="number"
                min="0"
                name="maxInvestment"
                className="form-control"
                value={formData.maxInvestment}
                onChange={handleChange}
                placeholder="e.g., 150000"
              />
            </div>
          </div>
        </fieldset>

        <div className="irc-submit">
          <button type="submit" className="btn btn-primary w-100">
            Create Request
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="irc-modal-title"
        >
          <div className="modal-content">
            <h5 id="irc-modal-title">Create this request?</h5>
            <p className="modal-body">
              Your request will be visible to entrepreneurs who can respond with
              pitches.
            </p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmSubmit}>
                Yes, Create
              </button>
              <button className="cancel-btn" onClick={cancelSubmit}>
                No, Cancel
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
