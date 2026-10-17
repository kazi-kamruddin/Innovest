import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiShield } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import InvestorRequestForm, {
  EMPTY_INVESTOR_REQUEST,
  getInvestorRequestPayload,
  InvestorRequestConfirmDialog,
  InvestorRequestState,
  validateInvestorRequestFields,
} from "../components/InvestorRequestForm";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function InvestorRequestCreate() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...EMPTY_INVESTOR_REQUEST });
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = Boolean(
    formData.title ||
    formData.description ||
    formData.category ||
    formData.minInvestment ||
    formData.maxInvestment
  );

  const handleReview = (event) => {
    event.preventDefault();
    const fieldErrors = validateInvestorRequestFields(formData);
    setErrors(fieldErrors);
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length > 0) {
      toast.error(fieldErrors[errorKeys[0]]);
      const fieldIdMap = {
        title: "iv-irf-title",
        category: "iv-irf-category",
        description: "iv-irf-description",
        minInvestment: "iv-irf-min",
        maxInvestment: "iv-irf-max",
      };
      const firstEl = document.getElementById(fieldIdMap[errorKeys[0]]);
      if (firstEl) {
        firstEl.focus();
        firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setConfirmOpen(true);
  };

  async function createRequest() {
    if (saving) return;
    const token = localStorage.getItem("token")?.trim();
    if (!token || !user?.id) {
      toast.error("Please sign in again to create an investor request.");
      return;
    }
    if (!API_BASE) return toast.error("API URL is not configured.");

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/investor-request/create-new-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ investorId: user.id, ...getInvestorRequestPayload(formData) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to create investor request.");

      setConfirmOpen(false);
      toast.success("Investor request created successfully.");
      navigate("/investor-request");
    } catch (error) {
      console.error("Investor request creation failed:", error);
      toast.error(error.message || "Unable to create the request.");
    } finally {
      setSaving(false);
    }
  }

  if (!user?.id) {
    return (
      <main className="iv-irf-page"><div className="iv-irf-container">
        <InvestorRequestState icon={FiShield} title="Sign in to create a request" description="You need an account to publish investment requests."
          action={<Link className="iv-irf-primary" to="/login">Sign in <FiArrowRight size={16} /></Link>} />
      </div></main>
    );
  }

  return (
    <>
      <InvestorRequestForm
        mode="create"
        formData={formData}
        onChange={setFormData}
        onSubmit={handleReview}
        busy={saving}
        errors={errors}
        isDirty={isDirty}
      />
      {confirmOpen && (
          <InvestorRequestConfirmDialog
            title="Publish this request?"
            description="Your investment request will appear in the open requests feed, where entrepreneurs can respond with pitches."
            confirmLabel="Publish request"
            busy={saving}
            onConfirm={createRequest}
            onCancel={() => setConfirmOpen(false)}
          />
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
