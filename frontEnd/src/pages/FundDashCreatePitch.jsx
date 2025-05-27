import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../styles/fund-dash-create-pitch.css';

const FundDashCreatePitch = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit a pitch.");
      console.warn(`[WARN] Attempted pitch submission without auth`);
      return;
    }

    const token = localStorage.getItem("token")?.trim();

    console.log(`[INFO] Submitting pitch | user_id=${user.id}`);
    console.log("[DEBUG] Payload:", formData);
    console.log("[DEBUG] Token present:", Boolean(token));

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/pitches",
        { ...formData, user_id: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[SUCCESS] Pitch submitted | pitch_id:", response.data?.id);
      toast.success("Pitch submitted successfully!");

      setTimeout(() => {
        navigate("/fundraise-dashboard");
      }, 2000);

      setFormData({
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
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      console.error(`[ERROR] Pitch submission failed | status=${status} | message=${message}`);
      toast.error("Failed to submit pitch.");
    }
  };

  return (
    <div className="investment-pitches">
      <h2 className="text-center mb-4">Create a New Pitch</h2>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
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

        <button type="submit" className="btn btn-primary w-100">Submit Pitch</button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default FundDashCreatePitch;
