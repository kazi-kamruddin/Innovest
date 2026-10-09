import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";

import PitchEditorForm, {
  EMPTY_PITCH,
  normalizePitch,
  PitchEditorStatus,
  validatePitch,
} from "../components/PitchEditorForm";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function FundDashEditPitch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [formData, setFormData] = useState({ ...EMPTY_PITCH });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadPitch() {
      setLoading(true);
      setLoadError("");

      try {
        if (!API_BASE) throw new Error("The API URL is not configured.");

        const response = await fetch(
          `${API_BASE}/pitches/${encodeURIComponent(id)}`,
          { signal: controller.signal }
        );

        if (response.status === 404) throw new Error("This pitch could not be found.");
        if (!response.ok) throw new Error("Failed to load the pitch details.");

        const data = await response.json();

        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Unexpected API response.");
        }
        if (String(data.user_id) !== String(user.id)) {
          throw new Error("You can only edit pitches created by your account.");
        }

        if (!controller.signal.aborted) setFormData(normalizePitch(data));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error loading pitch:", error);
          setLoadError(error.message || "Failed to load pitch details.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPitch();
    return () => controller.abort();
  }, [id, user?.id, retryKey]);

  useEffect(() => {
    if (!showModal) return;
    cancelRef.current?.focus();

    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !submitting) setShowModal(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [showModal, submitting]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationError = validatePitch(formData);
    if (validationError) return toast.error(validationError);
    setShowModal(true);
  };

  const confirmUpdate = async () => {
    if (submitting || !user?.id) return;

    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      setShowModal(false);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE}/pitches/users/${user.id}/pitches/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to update pitch.");

      setShowModal(false);
      toast.success("Pitch updated successfully!");
      setTimeout(() => navigate("/fundraise-dashboard"), 1300);
    } catch (error) {
      console.error("Pitch update failed:", error);
      toast.error(error.message || "Failed to update pitch.");
      setShowModal(false);
      setSubmitting(false);
    }
  };

  if (!user?.id) {
    return (
      <PitchEditorStatus
        signIn
        title="Sign in to edit your pitch"
        message="You must be signed in to edit a fundraising pitch."
      />
    );
  }

  if (loading) {
    return (
      <PitchEditorStatus
        loading
        title="Loading your pitch"
        message="Getting the details ready for editing..."
      />
    );
  }

  if (loadError) {
    return (
      <PitchEditorStatus
        title="Couldn't open this pitch"
        message={loadError}
        retry={() => setRetryKey((count) => count + 1)}
      />
    );
  }

  const dialog = showModal ? (
    <div
      className="iv-pe-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          setShowModal(false);
        }
      }}
    >
      <div
        className="iv-pe-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="iv-pe-dialog-title"
        aria-describedby="iv-pe-dialog-description"
      >
        <span className="iv-pe-dialog-icon">
          <FiCheckCircle size={22} aria-hidden="true" />
        </span>
        <h2 id="iv-pe-dialog-title">Save your changes?</h2>
        <p id="iv-pe-dialog-description">
          Your updated pitch details will be available to investors.
        </p>
        <div className="iv-pe-dialog-actions">
          <button
            type="button"
            className="iv-pe-cancel"
            ref={cancelRef}
            onClick={() => setShowModal(false)}
            disabled={submitting}
          >
            Go back
          </button>
          <button
            type="button"
            className="iv-pe-primary"
            disabled={submitting}
            onClick={confirmUpdate}
          >
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <PitchEditorForm
        mode="edit"
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        busy={submitting}
        dialog={dialog}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
