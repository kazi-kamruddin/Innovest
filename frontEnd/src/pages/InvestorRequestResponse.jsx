// src/pages/CreatePitchInResponse.jsx
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/fund-dash-create-pitch.css";

const CreatePitchInResponse = () => {
  const { user } = useAuthContext();
  const { id: requestId } = useParams(); 
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const [submitting, setSubmitting] = useState(false);
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
    forRequestId: requestId,
  });

  const industryOptions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Real Estate",
    "Education",
    "Food & Beverage",
    "Other",
  ];
  const stageOptions = ["Idea", "Prototype", "Early Revenue", "Scaling", "Profitable"];
  const investorRoleOptions = ["Silent Investor", "Active Partner", "Advisor", "Board Member"];
  const countryOptions = ["Afghanistan","Bangladesh","Bhutan","India","Maldives","Nepal","Pakistan","Sri Lanka"];

  const limits = useMemo(
    () => ({
      title: 120,
      long: 1200, // for textareas
    }),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Keep numbers non-negative (basic guard; server is still source of truth)
    if (name === "total_raising_amount" || name === "minimum_investment") {
      const clean = value === "" ? "" : Math.max(0, Number(value || 0));
      setFormData((s) => ({ ...s, [name]: clean }));
      return;
    }

    // Enforce title char limit
    if (name === "title" && value.length > limits.title) return;

    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit a pitch.");
      return;
    }

    // Simple client-side checks (non-blocking for server rules)
    if (!formData.title.trim()) return toast.error("Please add a pitch title.");
    if (!formData.country) return toast.error("Please select a country.");
    if (!formData.industry) return toast.error("Please select an industry.");

    // Optional: logical check
    if (
      formData.total_raising_amount &&
      formData.minimum_investment &&
      Number(formData.minimum_investment) > Number(formData.total_raising_amount)
    ) {
      return toast.error("Minimum investment cannot exceed total raising amount.");
    }

    const token = localStorage.getItem("token")?.trim();
    setSubmitting(true);

    try {
      await axios.post(
        `${API_BASE}/pitches/in-response/${requestId}`,
        { ...formData, user_id: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Pitch submitted successfully in response!");
      setTimeout(() => {
        navigate("/investor-request");
      }, 1200);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;
      console.error(
        `[ERROR] Pitch-in-response failed | status=${status} | message=${message}`
      );
      toast.error("Failed to submit pitch in response.");
    } finally {
      setSubmitting(false);
    }
  };

  const chars = {
    title: formData.title.length,
    the_business: formData.the_business.length,
    the_market: formData.the_market.length,
    progress: formData.progress.length,
    objective: formData.objective.length,
  };

  return (
    <div className="investment-pitches cpr">
      <div className="cpr-header">
        <div>
          <h2 className="cpr-title">Create a Pitch in Response</h2>
          <p className="cpr-sub">Replying to investor request <span className="cpr-badge">#{requestId}</span></p>
        </div>

        <div className="cpr-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate("/investor-request")}
          >
            Back to Requests
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="cpr-form card">
        {/* Basic Info */}
        <fieldset className="cpr-group">
          <legend>Basic Info</legend>

          <div className="cpr-row">
            <div className="cpr-col">
              <label className="form-label">Pitch Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
                aria-describedby="titleHelp"
              />
              <div id="titleHelp" className="cpr-hint">
                {chars.title}/{limits.title}
              </div>
            </div>
          </div>

          <div className="cpr-row">
            <div className="cpr-col">
              <label className="form-label">Company Location</label>
              <input
                type="text"
                name="company_location"
                className="form-control"
                value={formData.company_location}
                onChange={handleChange}
                placeholder="City, State/Division"
              />
            </div>

            <div className="cpr-col">
              <label className="form-label">Country</label>
              <select
                name="country"
                className="form-control"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="">Select Country</option>
                {countryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cpr-row">
            <div className="cpr-col">
              <label className="form-label">Cell Number</label>
              <input
                type="text"
                name="cell_number"
                className="form-control"
                value={formData.cell_number}
                onChange={handleChange}
                placeholder="+8801XXXXXXXXX"
              />
            </div>
            <div className="cpr-col">
              <label className="form-label">Industry</label>
              <select
                name="industry"
                className="form-control"
                value={formData.industry}
                onChange={handleChange}
                required
              >
                <option value="">Select Industry</option>
                {industryOptions.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
            <div className="cpr-col">
              <label className="form-label">Stage</label>
              <select
                name="stage"
                className="form-control"
                value={formData.stage}
                onChange={handleChange}
              >
                <option value="">Select Stage</option>
                {stageOptions.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cpr-row">
            <div className="cpr-col">
              <label className="form-label">Ideal Investor Role</label>
              <select
                name="ideal_investor_role"
                className="form-control"
                value={formData.ideal_investor_role}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                {investorRoleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="cpr-col">
              <label className="form-label">Total Raising Amount</label>
              <input
                type="number"
                min="0"
                name="total_raising_amount"
                className="form-control"
                value={formData.total_raising_amount}
                onChange={handleChange}
                placeholder="e.g., 500000"
              />
            </div>
            <div className="cpr-col">
              <label className="form-label">Minimum Investment</label>
              <input
                type="number"
                min="0"
                name="minimum_investment"
                className="form-control"
                value={formData.minimum_investment}
                onChange={handleChange}
                placeholder="e.g., 25000"
              />
            </div>
          </div>
        </fieldset>

        {/* Narrative */}
        <fieldset className="cpr-group">
          <legend>Narrative</legend>

          <div className="cpr-row">
            <div className="cpr-col-full">
              <label className="form-label">The Business</label>
              <textarea
                name="the_business"
                className="form-control"
                rows="3"
                value={formData.the_business}
                onChange={(e) =>
                  e.target.value.length <= limits.long && handleChange(e)
                }
              />
              <div className="cpr-hint">
                {chars.the_business}/{limits.long}
              </div>
            </div>
          </div>

          <div className="cpr-row">
            <div className="cpr-col-full">
              <label className="form-label">The Market</label>
              <textarea
                name="the_market"
                className="form-control"
                rows="3"
                value={formData.the_market}
                onChange={(e) =>
                  e.target.value.length <= limits.long && handleChange(e)
                }
              />
              <div className="cpr-hint">
                {chars.the_market}/{limits.long}
              </div>
            </div>
          </div>

          <div className="cpr-row">
            <div className="cpr-col-full">
              <label className="form-label">Progress</label>
              <textarea
                name="progress"
                className="form-control"
                rows="3"
                value={formData.progress}
                onChange={(e) =>
                  e.target.value.length <= limits.long && handleChange(e)
                }
              />
              <div className="cpr-hint">
                {chars.progress}/{limits.long}
              </div>
            </div>
          </div>

          <div className="cpr-row">
            <div className="cpr-col-full">
              <label className="form-label">Objective</label>
              <textarea
                name="objective"
                className="form-control"
                rows="3"
                value={formData.objective}
                onChange={(e) =>
                  e.target.value.length <= limits.long && handleChange(e)
                }
              />
              <div className="cpr-hint">
                {chars.objective}/{limits.long}
              </div>
            </div>
          </div>
        </fieldset>

        <div className="cpr-submit">
          <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Response Pitch"}
          </button>
        </div>
      </form>

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

export default CreatePitchInResponse;
