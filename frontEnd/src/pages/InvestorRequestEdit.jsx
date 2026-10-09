import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowRight, FiLock, FiShield } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import InvestorRequestForm, {
  EMPTY_INVESTOR_REQUEST,
  getInvestorRequestPayload,
  InvestorRequestConfirmDialog,
  InvestorRequestState,
  normalizeInvestorRequest,
  validateInvestorRequest,
} from "../components/InvestorRequestForm";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function InvestorRequestEdit() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...EMPTY_INVESTOR_REQUEST });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    async function loadRequest() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token")?.trim();
        if (!token || !API_BASE) throw new Error("Session or API configuration is unavailable.");
        const response = await fetch(`${API_BASE}/investor-request/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Failed to fetch this request.");
        if (String(data.investorId) !== String(user.id)) {
          throw new Error("You can only edit requests you've created.");
        }
        if (!controller.signal.aborted) setFormData(normalizeInvestorRequest(data));
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error loading investor request:", err);
          setError(err.message || "Unable to load the request.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadRequest();
    return () => controller.abort();
  }, [id, user?.id, retry]);

  const handleReview = (event) => {
    event.preventDefault();
    const issue = validateInvestorRequest(formData);
    if (issue) return toast.error(issue);
    setConfirmOpen(true);
  };

  async function saveChanges() {
    if (saving) return;
    const token = localStorage.getItem("token")?.trim();
    if (!token || !user?.id || !API_BASE) {
      toast.error("Session or API configuration is unavailable.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/investor-request/edit-request/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(getInvestorRequestPayload(formData)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to update the request.");
      setConfirmOpen(false);
      toast.success("Request updated successfully.");
      navigate("/investor-request");
    } catch (err) {
      console.error("Error updating request:", err);
      toast.error(err.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!user?.id) {
    return (
      <main className="iv-irf-page"><div className="iv-irf-container">
        <InvestorRequestState icon={FiShield} title="Sign in to edit a request" description="You need to sign in to manage your investor requests."
          action={<Link className="iv-irf-primary" to="/login">Sign in <FiArrowRight size={16} /></Link>} />
      </div></main>
    );
  }

  if (loading || error) {
    return (
      <main className="iv-irf-page"><div className="iv-irf-container">
        <InvestorRequestState
          icon={error ? FiLock : undefined}
          title={error ? "Request unavailable" : "Loading your request..."}
          description={error || "We're getting the details ready for editing."}
          loading={loading}
          retry={error ? () => setRetry((v) => v + 1) : undefined}
        />
      </div></main>
    );
  }

  return (
    <>
      <InvestorRequestForm mode="edit" formData={formData} onChange={setFormData} onSubmit={handleReview} busy={saving} />
      {confirmOpen && (
          <InvestorRequestConfirmDialog
            title="Save these changes?"
            description="The updated title, description, category and investment range will be visible in the open requests feed."
            confirmLabel="Save changes"
            busy={saving}
            onConfirm={saveChanges}
            onCancel={() => setConfirmOpen(false)}
          />
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
