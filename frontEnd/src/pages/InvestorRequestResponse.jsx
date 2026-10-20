import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiDollarSign,
  FiFileText,
  FiInfo,
  FiMapPin,
  FiRefreshCw,
  FiSend,
  FiShield,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  InvestorRequestHeader,
  InvestorRequestState,
} from "../components/InvestorRequestForm";
import {
  investmentRange,
  moneyText,
  REQUEST_CATEGORIES,
} from "../utils/investorRequestUtils";
import "../styles/investor-request-flow.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const STAGES = ["Idea", "Prototype", "Early Revenue", "Scaling", "Profitable"];
const ROLES = ["Silent Investor", "Active Partner", "Advisor", "Board Member"];
const COUNTRIES = ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", "Nepal", "Pakistan", "Sri Lanka"];

const EMPTY_PITCH = {
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
};

const SECTIONS = [
  {
    number: "01", title: "Business essentials", description: "Introduce your venture and where you're based.", icon: FiBriefcase,
    fields: [
      { name: "title", label: "Pitch title", required: true, full: true, maxLength: 120, placeholder: "A clear, memorable pitch title" },
      { name: "company_location", label: "Company location", placeholder: "City or division" },
      { name: "country", label: "Country", required: true, options: COUNTRIES },
      { name: "cell_number", label: "Contact number", type: "tel", placeholder: "+8801XXXXXXXXX" },
      { name: "industry", label: "Industry", required: true, options: REQUEST_CATEGORIES },
      { name: "stage", label: "Business stage", options: STAGES },
      { name: "ideal_investor_role", label: "Ideal investor role", options: ROLES },
    ],
  },
  {
    number: "02", title: "Funding details", description: "Show how much capital you're raising and your minimum investment.", icon: FiDollarSign,
    fields: [
      { name: "total_raising_amount", label: "Total raising amount (USD)", type: "number", placeholder: "e.g. 500000" },
      { name: "minimum_investment", label: "Minimum investment (USD)", type: "number", placeholder: "e.g. 25000" },
    ],
  },
  {
    number: "03", title: "Tell your story", description: "Help the investor understand your business and its potential.", icon: FiFileText,
    fields: [
      { name: "the_business", label: "The business", textarea: true, maxLength: 1200, placeholder: "Describe your venture and the problem it solves" },
      { name: "the_market", label: "The market", textarea: true, maxLength: 1200, placeholder: "Who are your potential customers?" },
      { name: "progress", label: "Progress", textarea: true, maxLength: 1200, placeholder: "What have you built or achieved?" },
      { name: "objective", label: "Objective", textarea: true, maxLength: 1200, placeholder: "What comes next?" },
    ],
  },
];

function PitchField({ field, value, onChange, disabled, error, helper }) {
  const id = `iv-irf-pitch-${field.name}`;
  const common = {
    id,
    name: field.name,
    value: value ?? "",
    onChange,
    disabled,
    required: Boolean(field.required),
    maxLength: field.maxLength,
    "aria-invalid": Boolean(error),
    "aria-describedby": error
      ? `${id}-error`
      : field.maxLength
      ? `${id}-count`
      : undefined,
  };
  return (
    <div className={`iv-irf-field ${field.full ? "iv-irf-full" : ""} ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{field.label}{field.required && <span className="iv-irf-required"> *</span>}</label>
      {field.options ? (
        <select {...common}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options.map((valueOption) => <option key={valueOption} value={valueOption}>{valueOption}</option>)}
        </select>
      ) : field.textarea ? (
        <textarea {...common} rows={4} placeholder={field.placeholder} />
      ) : (
        <input
          {...common}
          type={field.type || "text"}
          placeholder={field.placeholder}
          min={field.type === "number" ? 0 : undefined}
          step={field.type === "number" ? "any" : undefined}
          onWheel={field.type === "number" ? (e) => e.target.blur() : undefined}
        />
      )}
      {helper && !error && <span className="iv-irf-amount-helper">{helper}</span>}
      {error && <span id={`${id}-error`} className="iv-irf-field-error" role="alert">{error}</span>}
      {field.maxLength && !error && (
        <span id={`${id}-count`} className="iv-irf-hint iv-irf-char-count">{String(value ?? "").length} / {field.maxLength}</span>
      )}
    </div>
  );
}

function validateResponsePitchFields(formData) {
  const errors = {};
  if (!formData.title?.trim()) errors.title = "Please enter a pitch title.";
  if (!formData.country) errors.country = "Please select a country.";
  if (!formData.industry) errors.industry = "Please select an industry.";

  for (const name of ["total_raising_amount", "minimum_investment"]) {
    const value = formData[name];
    if (value !== "" && value !== null && value !== undefined && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
      errors[name] = "Funding amounts must be valid non-negative numbers.";
    }
  }

  if (
    formData.minimum_investment !== "" &&
    formData.total_raising_amount !== "" &&
    formData.minimum_investment !== null &&
    formData.total_raising_amount !== null &&
    !errors.minimum_investment &&
    !errors.total_raising_amount &&
    Number(formData.minimum_investment) > Number(formData.total_raising_amount)
  ) {
    errors.minimum_investment = "Minimum investment cannot exceed the raising goal.";
  }

  return errors;
}

export default function InvestorRequestResponse() {
  const { id: requestId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const redirectRef = useRef(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [formData, setFormData] = useState({ ...EMPTY_PITCH });
  const [errors, setErrors] = useState({});
  const [userPitches, setUserPitches] = useState([]);
  const [selectedPitchId, setSelectedPitchId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isDirty = Boolean(
    formData.title ||
    formData.company_location ||
    formData.country ||
    formData.cell_number ||
    formData.industry ||
    formData.stage ||
    formData.ideal_investor_role ||
    formData.total_raising_amount ||
    formData.minimum_investment ||
    formData.the_business ||
    formData.the_market ||
    formData.progress ||
    formData.objective
  );

  useEffect(() => () => { if (redirectRef.current) clearTimeout(redirectRef.current); }, []);

  useEffect(() => {
    if (!isDirty || submitted) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, submitted]);

  const handleLeave = (e) => {
    if (isDirty && !submitted && !window.confirm("You have unsaved changes in your pitch response. Are you sure you want to leave?")) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!user?.id || !API_BASE) return;
    const token = localStorage.getItem("token")?.trim();
    if (!token) return;
    fetch(`${API_BASE}/pitches/users/${encodeURIComponent(user.id)}/pitches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUserPitches(data);
        }
      })
      .catch((err) => console.error("Unable to load user pitches for response prefill:", err));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    async function loadRequest() {
      setLoading(true);
      setLoadError("");
      try {
        const token = localStorage.getItem("token")?.trim();
        if (!token || !API_BASE) throw new Error("Session or API configuration is unavailable.");
        const response = await fetch(`${API_BASE}/investor-request/${encodeURIComponent(requestId)}`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Unable to find this investor request.");
        if (data.status !== "open") throw new Error("This request is no longer open for responses.");
        if (String(data.investorId) === String(user.id)) throw new Error("You cannot respond to your own investor request.");
        if (!controller.signal.aborted) setRequest(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Unable to retrieve investor request:", error);
          setLoadError(error.message || "This request is unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadRequest();
    return () => controller.abort();
  }, [requestId, user?.id, retryKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePrefillSelect = (e) => {
    const pitchId = e.target.value;
    setSelectedPitchId(pitchId);
    if (!pitchId) return;
    const chosen = userPitches.find((p) => String(p.id) === String(pitchId));
    if (!chosen) return;
    setFormData({
      title: chosen.title || "",
      company_location: chosen.company_location || "",
      country: chosen.country || "",
      cell_number: chosen.cell_number || "",
      industry: chosen.industry || "",
      stage: chosen.stage || "",
      ideal_investor_role: chosen.ideal_investor_role || "",
      total_raising_amount: chosen.total_raising_amount ?? "",
      minimum_investment: chosen.minimum_investment ?? "",
      the_business: chosen.the_business || "",
      the_market: chosen.the_market || "",
      progress: chosen.progress || "",
      objective: chosen.objective || "",
    });
    setErrors({});
    toast.info(`Prefilled form from "${chosen.title}"`);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting || submitted) return;
    const fieldErrors = validateResponsePitchFields(formData);
    setErrors(fieldErrors);
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length > 0) {
      toast.error(fieldErrors[errorKeys[0]]);
      const firstEl = document.getElementById(`iv-irf-pitch-${errorKeys[0]}`);
      if (firstEl) {
        firstEl.focus();
        firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const token = localStorage.getItem("token")?.trim();
    if (!token || !user?.id || !API_BASE) {
      toast.error("Please sign in again to submit a response pitch.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        user_id: user.id,
        forRequestId: requestId,
        total_raising_amount: formData.total_raising_amount === "" ? null : Number(formData.total_raising_amount),
        minimum_investment: formData.minimum_investment === "" ? null : Number(formData.minimum_investment),
      };
      const response = await fetch(`${API_BASE}/pitches/in-response/${encodeURIComponent(requestId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to submit your pitch.");
      setSubmitted(true);
      toast.success("Your pitch was submitted successfully!");
      redirectRef.current = setTimeout(() => navigate("/investor-request"), 950);
    } catch (error) {
      console.error("Response pitch submission failed:", error);
      toast.error(error.message || "Unable to submit the response pitch.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user?.id || loading || loadError) {
    return (
      <main className="iv-irf-page"><div className="iv-irf-container">
        <InvestorRequestState
          icon={!user?.id ? FiShield : loading ? FiRefreshCw : FiInfo}
          title={!user?.id ? "Sign in to respond" : loading ? "Loading the investor request..." : "Unable to respond to this request"}
          description={!user?.id ? "Sign in to submit a pitch in response to an investor's request." : loading ? "Checking the request details and availability." : loadError}
          loading={Boolean(user?.id) && loading}
          retry={loadError ? () => setRetryKey((value) => value + 1) : undefined}
          action={!user?.id ? <Link to="/login" className="iv-irf-primary">Sign in <FiArrowRight size={16} /></Link> : undefined}
        />
      </div></main>
    );
  }

  return (
    <main className="iv-irf-page">
      <div className="iv-irf-container">
        <InvestorRequestHeader
          eyebrow="ENTREPRENEUR WORKSPACE"
          title="Respond with a" accent="pitch."
          description="Present your venture to the investor who posted this opportunity."
          actions={<span className="iv-irf-required-note">* Required fields</span>}
          onBackClick={handleLeave}
        />
        <section className="iv-irf-target" aria-label="Investor request being answered">
          <div className="iv-irf-target-symbol"><FiCheckCircle size={21} aria-hidden="true" /></div>
          <div className="iv-irf-target-details">
            <span>YOU&apos;RE RESPONDING TO REQUEST #{requestId}</span>
            <h2>{request.title}</h2>
            <p>{request.category || "Investment opportunity"} · {investmentRange(request)}</p>
          </div>
          <span className="iv-irf-target-status">Open</span>
        </section>

        {userPitches.length > 0 && (
          <div className="iv-irf-prefill-banner">
            <span>💡 Have an existing pitch? Prefill this response:</span>
            <select
              value={selectedPitchId}
              onChange={handlePrefillSelect}
              disabled={submitting || submitted}
              aria-label="Prefill form from an existing pitch"
            >
              <option value="">-- Choose one of your existing pitches --</option>
              {userPitches.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.industry || "General"})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="iv-irf-layout">
          <form className="iv-irf-form" onSubmit={handleSubmit} noValidate>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <section className="iv-irf-panel" key={section.number}>
                  <div className="iv-irf-panel-head">
                    <span className="iv-irf-panel-icon"><Icon size={19} aria-hidden="true" /></span>
                    <div>
                      <span className="iv-irf-step">SECTION {section.number}</span>
                      <h2>{section.title}</h2>
                      <p>{section.description}</p>
                    </div>
                  </div>
                  <div className="iv-irf-fields">
                    {section.fields.map((field) => (
                      <PitchField
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        error={errors[field.name]}
                        helper={
                          (field.name === "total_raising_amount" || field.name === "minimum_investment")
                            ? moneyText(formData[field.name])
                            : undefined
                        }
                        onChange={handleChange}
                        disabled={submitting || submitted}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
            <div className="iv-irf-form-actions">
              <Link className="iv-irf-secondary" to="/investor-request" onClick={handleLeave}>Cancel</Link>
              <button type="submit" className="iv-irf-primary" disabled={submitting || submitted}>
                <FiSend size={16} aria-hidden="true" />
                {submitted ? "Submitted" : submitting ? "Submitting..." : "Submit response pitch"}
              </button>
            </div>
          </form>

          <aside className="iv-irf-preview-column">
            <div className="iv-irf-preview">
              <div className="iv-irf-preview-top"><span aria-hidden="true" /> LIVE PITCH PREVIEW</div>
              <div className="iv-irf-preview-illustration"><span><FiBriefcase size={25} /></span><div className="iv-irf-preview-rings" /></div>
              <div className="iv-irf-preview-body">
                <span className="iv-irf-preview-chip">{formData.industry || "Industry"}</span>
                <h2>{formData.title.trim() || "Your pitch title"}</h2>
                <p className="iv-irf-preview-location"><FiMapPin size={14} /> {[formData.company_location, formData.country].filter(Boolean).join(", ") || "Your location"}</p>
                {formData.the_business && <p>{formData.the_business}</p>}
                <div className="iv-irf-preview-budget iv-irf-preview-split">
                  <div><span>RAISING GOAL</span><strong>{moneyText(formData.total_raising_amount) || "—"}</strong></div>
                  <div><span>MIN. INVESTMENT</span><strong>{moneyText(formData.minimum_investment) || "—"}</strong></div>
                </div>
                <p className="iv-irf-preview-caption">Live preview only — submitting creates a real pitch linked to this request.</p>
              </div>
            </div>
            <div className="iv-irf-tip"><FiInfo size={19} aria-hidden="true" /><p>Be specific about your product, market and traction to help the investor evaluate your response.</p></div>
          </aside>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}
