import { useState } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PitchEditorForm, {
  PitchEditorStatus,
} from "../components/PitchEditorForm";
import {
  EMPTY_PITCH,
  validatePitchFields,
} from "../utils/pitchEditorUtils";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function FundDashCreatePitch() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...EMPTY_PITCH });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isDirty = Object.keys(formData).some((key) => formData[key] !== EMPTY_PITCH[key]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!user?.id) {
      toast.error("Please sign in to create a pitch.");
      return;
    }

    const fieldErrors = validatePitchFields(formData);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const firstKey = Object.keys(fieldErrors)[0];
      const el = document.getElementById(`pitch-editor-${firstKey}`);
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error(fieldErrors[firstKey]);
      return;
    }
    setErrors({});

    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }
    if (!API_BASE) {
      toast.error("The API URL is not configured.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/pitches`,
        { ...formData, user_id: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Pitch submitted successfully!");
      setTimeout(() => navigate("/fundraise-dashboard"), 1200);
    } catch (error) {
      console.error("Pitch submission failed:", error);
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to submit pitch. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <>
      {!user?.id ? (
        <PitchEditorStatus
          signIn
          title="Sign in to create a pitch"
          message="Your fundraising workspace is available after you sign in."
        />
      ) : (
        <PitchEditorForm
          mode="create"
          formData={formData}
          errors={errors}
          isDirty={isDirty}
          onChange={handleChange}
          onSubmit={handleSubmit}
          busy={submitting}
        />
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
