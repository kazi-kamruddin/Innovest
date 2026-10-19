import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiDollarSign,
  FiFileText,
  FiInfo,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import "../styles/investor-request-flow.css";
import {
  REQUEST_CATEGORIES,
  moneyText,
  investmentRange,
} from "../utils/investorRequestUtils";

export function InvestorRequestHeader({ eyebrow, title, accent, description, actions, backLabel = "Back to requests", backTo = "/investor-request", onBackClick }) {
  return (
    <>
      <Link className="iv-irf-back" to={backTo} onClick={onBackClick}>
        <FiArrowLeft size={16} aria-hidden="true" /> {backLabel}
      </Link>
      <header className="iv-irf-header">
        <div className="iv-irf-header-copy">
          <p className="iv-irf-eyebrow"><span aria-hidden="true" /> {eyebrow}</p>
          <h1>{title} <em>{accent}</em></h1>
          <p className="iv-irf-subtitle">{description}</p>
        </div>
        {actions && <div className="iv-irf-header-actions">{actions}</div>}
      </header>
    </>
  );
}

export function InvestorRequestState({ icon: Icon = FiRefreshCw, title, description, action, retry, loading = false }) {
  return (
    <section className="iv-irf-state" role={loading ? "status" : "alert"}>
      <span className="iv-irf-state-icon"><Icon size={24} aria-hidden="true" /></span>
      <h2>{title}</h2>
      <p>{description}</p>
      {!loading && (action || (retry && (
        <button type="button" onClick={retry} className="iv-irf-primary">
          <FiRefreshCw size={16} aria-hidden="true" /> Try again
        </button>
      )))}
    </section>
  );
}

export function InvestorRequestConfirmDialog({ title, description, confirmLabel, busy, onConfirm, onCancel, icon: Icon = FiCheckCircle }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [busy, onCancel]);

  return (
    <div
      className="iv-irf-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div className="iv-irf-modal" role="dialog" aria-modal="true" aria-labelledby="iv-irf-modal-heading" aria-describedby="iv-irf-modal-description">
        <button type="button" className="iv-irf-modal-x" onClick={onCancel} disabled={busy} aria-label="Close confirmation">
          <FiX size={19} />
        </button>
        <span className="iv-irf-modal-icon"><Icon size={22} aria-hidden="true" /></span>
        <h2 id="iv-irf-modal-heading">{title}</h2>
        <p id="iv-irf-modal-description">{description}</p>
        <div className="iv-irf-modal-actions">
          <button type="button" ref={cancelRef} className="iv-irf-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="iv-irf-primary" onClick={onConfirm} disabled={busy}>
            {busy ? "Please wait..." : confirmLabel} {!busy && <FiArrowRight size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestField({ label, id, required = false, error, helper, children }) {
  return (
    <div className={`iv-irf-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}{required && <span className="iv-irf-required"> *</span>}</label>
      {children}
      {helper && !error && <span className="iv-irf-amount-helper">{helper}</span>}
      {error && <span id={`${id}-error`} className="iv-irf-field-error" role="alert">{error}</span>}
    </div>
  );
}

export default function InvestorRequestForm({
  mode = "create",
  formData,
  onChange,
  onSubmit,
  busy = false,
  errors = {},
  isDirty = false,
}) {
  const editing = mode === "edit";

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleLeave = (e) => {
    if (isDirty && !window.confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
      e.preventDefault();
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange((current) => ({ ...current, [name]: value }));
  };

  return (
    <main className="iv-irf-page">
      <div className="iv-irf-container">
        <InvestorRequestHeader
          eyebrow="INVESTOR WORKSPACE"
          title={editing ? "Refine your" : "Create an investor"}
          accent={editing ? "request." : "request."}
          description={editing
            ? "Update the opportunity you're looking for and keep your request clear for entrepreneurs."
            : "Tell entrepreneurs what you want to invest in and what opportunities interest you."}
          actions={<span className="iv-irf-required-note">* Required fields</span>}
          onBackClick={handleLeave}
        />

        <div className="iv-irf-layout">
          <form className="iv-irf-form" onSubmit={onSubmit} noValidate>
            <section className="iv-irf-panel">
              <div className="iv-irf-panel-head">
                <span className="iv-irf-panel-icon"><FiFileText size={19} aria-hidden="true" /></span>
                <div>
                  <span className="iv-irf-step">SECTION 01</span>
                  <h2>Request details</h2>
                  <p>Describe the type of business you&apos;re looking for.</p>
                </div>
              </div>
              <div className="iv-irf-fields">
                <RequestField id="iv-irf-title" label="Request title" required error={errors.title}>
                  <input
                    id="iv-irf-title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={busy}
                    required
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? "iv-irf-title-error" : undefined}
                    placeholder="e.g. Seeking promising education startups"
                  />
                </RequestField>
                <RequestField id="iv-irf-category" label="Investment category" required error={errors.category}>
                  <select
                    id="iv-irf-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={busy}
                    required
                    aria-invalid={Boolean(errors.category)}
                    aria-describedby={errors.category ? "iv-irf-category-error" : undefined}
                  >
                    <option value="">Select a category</option>
                    {REQUEST_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </RequestField>
                <div className={`iv-irf-field iv-irf-full ${errors.description ? "has-error" : ""}`}>
                  <label htmlFor="iv-irf-description">Description<span className="iv-irf-required"> *</span></label>
                  <textarea
                    id="iv-irf-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={busy}
                    required
                    rows={6}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={errors.description ? "iv-irf-description-error" : undefined}
                    placeholder="Describe what you're looking for, your investment interests, and any preferences..."
                  />
                  {errors.description && (
                    <span id="iv-irf-description-error" className="iv-irf-field-error" role="alert">
                      {errors.description}
                    </span>
                  )}
                  <span className="iv-irf-hint">Clear details help entrepreneurs decide whether their idea is a good match.</span>
                </div>
              </div>
            </section>

            <section className="iv-irf-panel">
              <div className="iv-irf-panel-head">
                <span className="iv-irf-panel-icon"><FiDollarSign size={19} aria-hidden="true" /></span>
                <div>
                  <span className="iv-irf-step">SECTION 02</span>
                  <h2>Investment preferences</h2>
                  <p>Set your preferred budget. Both fields are optional.</p>
                </div>
              </div>
              <div className="iv-irf-fields">
                <RequestField
                  id="iv-irf-min"
                  label="Minimum investment (USD)"
                  error={errors.minInvestment}
                  helper={moneyText(formData.minInvestment)}
                >
                  <input
                    id="iv-irf-min"
                    name="minInvestment"
                    type="number"
                    min="0"
                    step="any"
                    value={formData.minInvestment}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    disabled={busy}
                    aria-invalid={Boolean(errors.minInvestment)}
                    aria-describedby={errors.minInvestment ? "iv-irf-min-error" : undefined}
                    placeholder="e.g. 25000"
                  />
                </RequestField>
                <RequestField
                  id="iv-irf-max"
                  label="Maximum investment (USD)"
                  error={errors.maxInvestment}
                  helper={moneyText(formData.maxInvestment)}
                >
                  <input
                    id="iv-irf-max"
                    name="maxInvestment"
                    type="number"
                    min="0"
                    step="any"
                    value={formData.maxInvestment}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    disabled={busy}
                    aria-invalid={Boolean(errors.maxInvestment)}
                    aria-describedby={errors.maxInvestment ? "iv-irf-max-error" : undefined}
                    placeholder="e.g. 150000"
                  />
                </RequestField>
              </div>
            </section>

            <div className="iv-irf-form-actions">
              <Link className="iv-irf-secondary" to="/investor-request" onClick={handleLeave}>Cancel</Link>
              <button type="submit" className="iv-irf-primary" disabled={busy}>
                {busy ? "Saving..." : editing ? "Review changes" : "Review request"}
                {!busy && <FiArrowRight size={17} aria-hidden="true" />}
              </button>
            </div>
          </form>

          <aside className="iv-irf-preview-column">
            <div className="iv-irf-preview">
              <div className="iv-irf-preview-top"><span aria-hidden="true" /> LIVE REQUEST PREVIEW</div>
              <div className="iv-irf-preview-illustration" aria-hidden="true">
                <span><FiBriefcase size={25} /></span>
                <div className="iv-irf-preview-rings" />
              </div>
              <div className="iv-irf-preview-body">
                <span className="iv-irf-preview-chip">{formData.category || "Investment category"}</span>
                <h2>{formData.title.trim() || "Your investor request"}</h2>
                <p>{formData.description.trim() || "Your investment interests and preferences will appear here as you type."}</p>
                <div className="iv-irf-preview-budget">
                  <span>PREFERRED INVESTMENT RANGE</span>
                  <strong>{investmentRange(formData)}</strong>
                </div>
                <p className="iv-irf-preview-caption">Preview only — this is not a published request.</p>
              </div>
            </div>
            <div className="iv-irf-tip"><FiInfo size={19} aria-hidden="true" /><p>Investors can update or close their requests later from the Investor Requests page.</p></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
