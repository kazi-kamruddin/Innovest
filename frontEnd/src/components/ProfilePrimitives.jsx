import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

export const PROFILE_API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export function csvItems(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : String(value).split(",");
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
}

export function initialsOf(value) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean);
  return words.length ? words.slice(0, 2).map((word) => word[0].toUpperCase()).join("") : "IN";
}

export function moneyText(value) {
  if (value === null || value === undefined || String(value).trim() === "") return "Not specified";
  const number = Number(value);
  return Number.isFinite(number)
    ? `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(number)}`
    : String(value);
}

export function ProfileAvatar({ name, large = false }) {
  return (
    <span className={`iv-profile-avatar ${large ? "iv-profile-avatar--large" : ""}`} aria-label={`Avatar for ${name || "member"}`} role="img">
      {initialsOf(name)}
    </span>
  );
}

export function ProfileCard({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section className={`iv-profile-card ${className}`}>
      <div className="iv-profile-card__head">
        {Icon && <span className="iv-profile-card__icon" aria-hidden="true"><Icon size={18} /></span>}
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="iv-profile-card__content">{children}</div>
    </section>
  );
}

export function InterestPills({ items, empty = "No interests added yet." }) {
  const values = csvItems(items);
  if (!values.length) return <p className="iv-profile-muted">{empty}</p>;
  return <div className="iv-profile-pills">{values.map((item) => <span className="iv-profile-pill" key={item}>{item}</span>)}</div>;
}

export function InterestPicker({ options, selected, onToggle }) {
  const allOptions = [...new Set([...options, ...selected])];
  return (
    <div className="iv-profile-picker">
      {allOptions.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            className={`iv-profile-picker__choice ${active ? "is-selected" : ""}`}
            aria-pressed={active}
            onClick={() => onToggle(option)}
          >
            <span className="iv-profile-picker__marker" aria-hidden="true">{active ? "✓" : "+"}</span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function ProfileLoading({ message = "Loading profile…" }) {
  return (
    <main className="iv-profile">
      <div className="iv-profile-container">
        <div className="iv-profile-feedback" role="status" aria-live="polite">
          <span className="iv-profile-spinner" aria-hidden="true" />
          <p>{message}</p>
        </div>
      </div>
    </main>
  );
}

export function ProfileFailure({ title = "Unable to load this profile", message = "Please try again.", onRetry, children }) {
  return (
    <main className="iv-profile">
      <div className="iv-profile-container">
        <div className="iv-profile-feedback" role="alert">
          <span className="iv-profile-feedback__icon"><FiAlertCircle size={23} /></span>
          <h1>{title}</h1>
          <p>{message}</p>
          <div className="iv-profile-feedback__actions">
            {onRetry && <button type="button" className="iv-profile-button iv-profile-button--solid" onClick={onRetry}><FiRefreshCw size={16} />Try again</button>}
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
