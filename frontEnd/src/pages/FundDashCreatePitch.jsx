import { useState } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PitchEditorForm, {
  EMPTY_PITCH,
  PitchEditorStatus,
  validatePitch,
} from "../components/PitchEditorForm";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function FundDashCreatePitch() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...EMPTY_PITCH });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!user?.id) {
      toast.error("Please sign in to create a pitch.");
      return;
    }

    const validationError = validatePitch(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

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
          onChange={handleChange}
          onSubmit={handleSubmit}
          busy={submitting}
        />
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
