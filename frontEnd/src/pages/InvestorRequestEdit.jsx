import React, { useEffect, useState } from "react";
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
    "Technology",
    "Healthcare",
    "Finance",
    "Real Estate",
    "Education",
    "Food & Beverage",
    "Other",
  ];

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
          minInvestment: data.minInvestment ?? "",
          maxInvestment: data.maxInvestment ?? "",
        });
      } catch (err) {
        console.error("Error fetching request:", err);
        toast.error("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, API_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Keep numbers non-negative; server remains source of truth
    if (name === "minInvestment" || name === "maxInvestment") {
      const v = value === "" ? "" : Math.max(0, Number(value || 0));
      setFormData((s) => ({ ...s, [name]: v }));
      return;
    }
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Please enter a title.");
    if (!formData.description.trim())
      return toast.error("Please add a description.");
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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update request");
      }

      toast.success("Request updated successfully!");
      setTimeout(() => navigate("/investor-request"), 900);
    } catch (err) {
      console.error("Error updating request:", err);
      toast.error(err.message || "Update failed");
    }
  };

  const cancelSubmit = () => setShowModal(false);

  if (loading) {
    return (
      <div className="investment-pitches irc-create">
        <div className="irc-header">
          <h2 className="irc-title">Edit Investor Request</h2>
        </div>
        <div className="irc-card">
          <div className="irc-group">
            <div className="irc-row">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="irc-col-full">
                  <div
                    style={{
                      height: 12,
                      width: ["60%", "100%", "80%", "40%", "70%", "50%"][i],
                      background:
                        "linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06))",
                      borderRadius: 6,
                      margin: "10px 0",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="investment-pitches irc-create">
      <div className="irc-header">
        <div>
          <h2 className="irc-title">Edit Investor Request</h2>
          <p className="irc-sub">
            Update the details of your request. Changes will be visible to entrepreneurs.
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
                placeholder="What kind of opportunity are you looking for? Any constraints or preferences?"
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
            Update Request
          </button>
        </div>
      </form>

      {showModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="irc-modal-title"
        >
          <div className="modal-content">
            <h5 id="irc-modal-title">Update this request?</h5>
            <p className="modal-body">
              Your changes will be saved and reflected immediately.
            </p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmSubmit}>
                Yes, Update
              </button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
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

export default EditInvestorRequest;
