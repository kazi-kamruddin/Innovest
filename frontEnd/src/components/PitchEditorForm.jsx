import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiDollarSign,
  FiFileText,
  FiMapPin,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

import "../styles/pitch-editor.css";

export const EMPTY_PITCH = {
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

export function normalizePitch(data) {
  return Object.fromEntries(
    Object.keys(EMPTY_PITCH).map((key) => [key, data?.[key] ?? ""])
  );
}

export function validatePitch(data) {
  if (!String(data.title ?? "").trim()) return "Please enter a pitch title.";
  if (!data.country) return "Please select a country.";
  if (!data.industry) return "Please select an industry.";

  const total = data.total_raising_amount;
  const minimum = data.minimum_investment;
  if (
    total !== "" && minimum !== "" &&
    Number(minimum) > Number(total)
  ) {
    return "Minimum investment cannot exceed the total raising amount.";
  }

  return null;
}

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Real Estate",
  "Education", "Food & Beverage", "Other",
];
const STAGES = ["Idea", "Prototype", "Early Revenue", "Scaling", "Profitable"];
const ROLES = ["Silent Investor", "Active Partner", "Advisor", "Board Member"];
const COUNTRIES = [
  "Afghanistan", "Bangladesh", "Bhutan", "India",
  "Maldives", "Nepal", "Pakistan", "Sri Lanka",
];

const SECTIONS = [
  {
    number: "01",
    title: "Business essentials",
    description: "Introduce your venture and where it's based.",
    icon: FiBriefcase,
    fields: [
      { name: "title", label: "Pitch title", placeholder: "A clear, memorable title", required: true, full: true, maxLength: 120 },
      { name: "company_location", label: "Company location", placeholder: "City or division" },
      { name: "country", label: "Country", placeholder: "Select country", required: true, options: COUNTRIES },
      { name: "cell_number", label: "Contact number", placeholder: "+8801XXXXXXXXX", type: "tel" },
      { name: "industry", label: "Industry", placeholder: "Select industry", required: true, options: INDUSTRIES },
      { name: "stage", label: "Business stage", placeholder: "Select stage", options: STAGES },
      { name: "ideal_investor_role", label: "Ideal investor role", placeholder: "Select investor role", options: ROLES },
    ],
  },
  {
    number: "02",
    title: "Investment details",
    description: "Let potential investors understand the funding you're seeking.",
    icon: FiDollarSign,
    fields: [
      { name: "total_raising_amount", label: "Total raising amount (USD)", placeholder: "e.g. 500000", type: "number" },
      { name: "minimum_investment", label: "Minimum investment (USD)", placeholder: "e.g. 25000", type: "number" },
    ],
  },
  {
    number: "03",
    title: "Tell your story",
    description: "Explain the opportunity, your traction, and what comes next.",
    icon: FiFileText,
    fields: [
      { name: "the_business", label: "The business", placeholder: "What does your venture do? What problem does it solve?", textarea: true, maxLength: 1200 },
      { name: "the_market", label: "The market", placeholder: "Who are your customers, and what opportunity do you see?", textarea: true, maxLength: 1200 },
      { name: "progress", label: "Progress", placeholder: "What have you built or achieved so far?", textarea: true, maxLength: 1200 },
      { name: "objective", label: "Objective", placeholder: "What are your next goals and priorities?", textarea: true, maxLength: 1200 },
    ],
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function previewAmount(value) {
  if (value === "" || value === null || value === undefined) return "—";
  const number = Number(value);
  return Number.isFinite(number)
    ? `$${currencyFormatter.format(number)}`
    : String(value);
}

function FormField({ field, value, onChange, disabled }) {
  const id = `pitch-editor-${field.name}`;
  const inputProps = {
    id,
    name: field.name,
    value: value ?? "",
    onChange,
    required: Boolean(field.required),
    disabled,
    maxLength: field.maxLength,
    "aria-describedby": field.maxLength ? `${id}-count` : undefined,
  };

  return (
    <div className={`iv-pe-field${field.full ? " iv-pe-field-full" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {field.required && <span className="iv-pe-required-star"> *</span>}
      </label>

      {field.options ? (
        <div className="iv-pe-select-wrap">
          <select {...inputProps}>
            <option value="">{field.placeholder}</option>
            {field.options.map((option) => (
              <option value={option} key={option}>{option}</option>
            ))}
          </select>
        </div>
      ) : field.textarea ? (
        <textarea {...inputProps} rows={4} placeholder={field.placeholder} />
      ) : (
        <input
          {...inputProps}
          type={field.type || "text"}
          placeholder={field.placeholder}
          min={field.type === "number" ? 0 : undefined}
          step={field.type === "number" ? "any" : undefined}
        />
      )}

      {field.maxLength && (
        <span id={`${id}-count`} className="iv-pe-character-count">
          {String(value ?? "").length} / {field.maxLength}
        </span>
      )}
    </div>
  );
}

function LivePreview({ formData }) {
  const location = [formData.company_location, formData.country]
    .filter(Boolean)
    .join(", ");

  return (
    <aside className="iv-pe-aside">
      <div className="iv-pe-preview">
        <div className="iv-pe-preview-top">
          <span className="iv-pe-live-dot" />
          LIVE PITCH PREVIEW
        </div>

        <div className="iv-pe-preview-head">
          <span className="iv-pe-preview-icon"><FiBriefcase size={20} /></span>
          <span className="iv-pe-preview-stage">{formData.stage || "Business stage"}</span>
        </div>

        <h2>{formData.title?.trim() || "Your pitch title"}</h2>
        <p className="iv-pe-preview-location">
          <FiMapPin size={14} aria-hidden="true" />
          {location || "Your location"}
        </p>
        <span className="iv-pe-preview-industry">
          {formData.industry || "Industry"}
        </span>

        <div className="iv-pe-preview-finance">
          <div>
            <span>RAISING GOAL</span>
            <strong>{previewAmount(formData.total_raising_amount)}</strong>
          </div>
          <div>
            <span>MIN. INVESTMENT</span>
            <strong>{previewAmount(formData.minimum_investment)}</strong>
          </div>
        </div>

        <p className="iv-pe-preview-caption">
          This is a preview of key details, not a published pitch.
        </p>
      </div>

      <div className="iv-pe-note">
        <FiCheckCircle size={19} aria-hidden="true" />
        <div>
          <strong>Make your pitch easy to evaluate</strong>
          <p>Use a specific title, explain your market clearly, and include progress investors can understand.</p>
        </div>
      </div>
    </aside>
  );
}

export function PitchEditorStatus({ title, message, retry, signIn = false, loading = false }) {
  return (
    <main className="iv-pe-page">
      <div className="iv-pe-wrap">
        <Link to="/fundraise-dashboard" className="iv-pe-back">
          <FiArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className="iv-pe-status" role="status">
          <span className="iv-pe-status-icon">
            {signIn ? <FiShield size={23} /> : <FiRefreshCw size={23} className={loading ? "iv-pe-loading" : ""} />}
          </span>
          <h1>{title}</h1>
          <p>{message}</p>
          {!loading && (signIn ? (
            <Link className="iv-pe-primary" to="/login">Sign in <FiArrowRight size={16} /></Link>
          ) : retry ? (
            <button type="button" className="iv-pe-primary" onClick={retry}>
              <FiRefreshCw size={16} /> Try again
            </button>
          ) : null)}
        </div>
      </div>
    </main>
  );
}

export default function PitchEditorForm({
  mode = "create",
  formData,
  onChange,
  onSubmit,
  busy = false,
  dialog = null,
}) {
  const editing = mode === "edit";

  return (
    <main className="iv-pe-page">
      <div className="iv-pe-wrap">
        <Link className="iv-pe-back" to="/fundraise-dashboard">
          <FiArrowLeft size={16} aria-hidden="true" />
          Back to dashboard
        </Link>

        <header className="iv-pe-header">
          <div>
            <p className="iv-pe-eyebrow"><span /> ENTREPRENEUR WORKSPACE</p>
            <h1>{editing ? "Refine your" : "Create a new"} <em>pitch.</em></h1>
            <p className="iv-pe-subtitle">
              {editing
                ? "Update the details investors see when they explore your opportunity."
                : "Present your venture clearly so potential investors can understand your opportunity."}
            </p>
          </div>
          <span className="iv-pe-header-note">* Required fields</span>
        </header>

        <div className="iv-pe-layout">
          <form className="iv-pe-form" onSubmit={onSubmit}>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <section className="iv-pe-panel" key={section.number}>
                  <div className="iv-pe-section-heading">
                    <span className="iv-pe-section-icon"><Icon size={19} aria-hidden="true" /></span>
                    <div>
                      <div className="iv-pe-section-label">SECTION {section.number}</div>
                      <h2>{section.title}</h2>
                      <p>{section.description}</p>
                    </div>
                  </div>
                  <div className="iv-pe-fields">
                    {section.fields.map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        onChange={onChange}
                        disabled={busy}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="iv-pe-action-row">
              <Link to="/fundraise-dashboard" className="iv-pe-cancel">Cancel</Link>
              <button className="iv-pe-primary" type="submit" disabled={busy}>
                {busy
                  ? editing ? "Updating pitch..." : "Publishing pitch..."
                  : editing ? "Review changes" : "Publish pitch"}
                {!busy && <FiArrowRight size={17} aria-hidden="true" />}
              </button>
            </div>
          </form>

          <LivePreview formData={formData} />
        </div>
      </div>
      {dialog}
    </main>
  );
}
