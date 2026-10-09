import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBriefcase, FiCheck, FiDollarSign, FiSave, FiTarget } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import {
  PROFILE_API, InterestPicker, InterestPills, moneyText,
  ProfileCard, ProfileFailure, ProfileLoading,
} from "../components/ProfilePrimitives.jsx";
import "../styles/profile-suite.css";

const industriesOptions = ["Technology", "Healthcare", "Finance", "Real Estate", "Education", "Food & Beverage"];
const fieldsOptions = [
  "AI", "Software", "Hardware", "Biotech", "Pharmaceuticals", "Banking",
  "Property Management", "EdTech", "Curriculum Development", "Restaurants",
  "Food Processing", "Beverages", "Sustainability", "Entertainment", "Logistics",
];

export default function ProfileInvestorInfo() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const redirectTimer = useRef(null);
  const [industries, setIndustries] = useState([]);
  const [fields, setFields] = useState([]);
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoadError("");
      setIndustries([]);
      setFields([]);
      setMinimum("");
      setMaximum("");
      try {
        if (!PROFILE_API) throw new Error("VITE_API_URL is not configured.");
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Your session has expired. Please sign in again.");
        const response = await fetch(`${PROFILE_API}/investor-info/${encodeURIComponent(user.id)}`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (response.status === 404) return; // New investor profile.
        if (!response.ok) throw new Error("Could not load your investor preferences.");
        const data = await response.json();
        if (controller.signal.aborted) return;
        setIndustries(data.preferred_industries ? data.preferred_industries.split(",").map((s) => s.trim()).filter(Boolean) : []);
        setFields(data.fields_of_interest ? data.fields_of_interest.split(",").map((s) => s.trim()).filter(Boolean) : []);
        setMinimum(data.investment_range_min == null ? "" : String(data.investment_range_min));
        setMaximum(data.investment_range_max == null ? "" : String(data.investment_range_max));
      } catch (err) {
        if (!controller.signal.aborted) setLoadError(err.message || "Could not load preferences.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [user?.id, retryKey]);

  function toggle(value, setter) {
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (saving || !user?.id) return;
    setSaveError("");
    const min = Number(minimum);
    const max = Number(maximum);
    // Existing backend parses both fields with parseFloat; blank strings lead to invalid SQL values.
    if (minimum.trim() === "" || maximum.trim() === "" || !Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0 || min > max) {
      setSaveError("Enter both investment amounts. They must be non-negative, and the maximum must be at least the minimum.");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(`${PROFILE_API}/investor-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: Number(user.id),
          preferred_industries: industries.join(", "),
          fields_of_interest: fields.join(", "),
          investment_range_min: min,
          investment_range_max: max,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status !== 201) throw new Error(data.message || data.error || "Unable to save investor preferences.");
      toast.success("Investor profile saved successfully.");
      redirectTimer.current = setTimeout(() => navigate("/profile"), 850);
    } catch (err) {
      console.error("Saving investor profile failed:", err);
      setSaveError(err.message || "Unable to save your investor profile.");
      toast.error("Couldn't save investor profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ProfileLoading message="Loading investor preferences…" />;
  if (loadError) return <ProfileFailure message={loadError} onRetry={() => setRetryKey((k) => k + 1)}><Link to="/profile" className="iv-profile-button iv-profile-button--outline">Back to profile</Link></ProfileFailure>;

  return (
    <main className="iv-profile">
      <div className="iv-profile-container">
        <Link to="/profile" className="iv-profile-back"><FiArrowLeft size={16} /> Back to profile</Link>
        <div className="iv-profile-page-heading">
          <div>
            <span className="iv-profile-eyebrow"><span /> YOUR WORKSPACE</span>
            <h1>Investor <em>preferences.</em></h1>
            <p>Let founders know what industries, fields, and investment sizes interest you.</p>
          </div>
        </div>

        <div className="iv-profile-layout iv-profile-layout--editor">
          <div className="iv-profile-main">
            <form onSubmit={handleSave} noValidate>
              <ProfileCard icon={FiBriefcase} title="Investing interests" subtitle="Choose the opportunities you want to explore">
                <div className="iv-profile-fields">
                  <div className="iv-profile-field">
                    <span id="iv-profile-industry-label"><FiBriefcase size={15} /> Preferred industries</span>
                    <p className="iv-profile-field-help">Select any industries you&apos;d like to invest in.</p>
                    <div role="group" aria-labelledby="iv-profile-industry-label"><InterestPicker options={industriesOptions} selected={industries} onToggle={(option) => toggle(option, setIndustries)} /></div>
                  </div>
                  <div className="iv-profile-field">
                    <span id="iv-profile-fields-label"><FiTarget size={15} /> Fields of interest</span>
                    <p className="iv-profile-field-help">Choose more specific topics that match your interests.</p>
                    <div role="group" aria-labelledby="iv-profile-fields-label"><InterestPicker options={fieldsOptions} selected={fields} onToggle={(option) => toggle(option, setFields)} /></div>
                  </div>
                </div>
              </ProfileCard>

              <ProfileCard icon={FiDollarSign} title="Investment range" subtitle="The minimum and maximum amounts you'd consider">
                <div className="iv-profile-fields iv-profile-fields--two">
                  <label className="iv-profile-field">
                    <span>Minimum investment *</span>
                    <input type="number" min="0" step="any" inputMode="decimal" value={minimum} onChange={(e) => setMinimum(e.target.value)} placeholder="e.g. 5000" required />
                  </label>
                  <label className="iv-profile-field">
                    <span>Maximum investment *</span>
                    <input type="number" min="0" step="any" inputMode="decimal" value={maximum} onChange={(e) => setMaximum(e.target.value)} placeholder="e.g. 50000" required />
                  </label>
                </div>
                <p className="iv-profile-field-help iv-profile-field-help--bottom">Both amounts are required by the existing investor-profile service. The maximum cannot be smaller than the minimum.</p>
              </ProfileCard>

              {saveError && <p className="iv-profile-form-error" role="alert">{saveError}</p>}
              <div className="iv-profile-form-actions">
                <Link to="/profile" className="iv-profile-button iv-profile-button--outline">Cancel</Link>
                <button type="submit" className="iv-profile-button iv-profile-button--solid" disabled={saving}>{saving ? "Saving…" : <><FiSave size={16} /> Save preferences</>}</button>
              </div>
            </form>
          </div>

          <aside className="iv-profile-side">
            <div className="iv-profile-preview-head"><span className="iv-profile-eyebrow"><span /> LIVE INVESTOR PREVIEW</span><p>How your preferences look together.</p></div>
            <section className="iv-profile-preview iv-profile-preview--investor">
              <div className="iv-profile-preview__banner" />
              <div className="iv-profile-preview__inner">
                <span className="iv-profile-card__icon"><FiBriefcase size={22} /></span>
                <h2>Investment overview</h2>
                <div className="iv-profile-info-grid">
                  <div className="iv-profile-info-cell"><span>Minimum</span><strong>{moneyText(minimum)}</strong></div>
                  <div className="iv-profile-info-cell"><span>Maximum</span><strong>{moneyText(maximum)}</strong></div>
                </div>
                <div className="iv-profile-preview__divider" />
                <span className="iv-profile-kicker">PREFERRED INDUSTRIES</span>
                <InterestPills items={industries} empty="No industries selected" />
                <span className="iv-profile-kicker">FIELDS OF INTEREST</span>
                <InterestPills items={fields} empty="No fields selected" />
              </div>
            </section>
            <div className="iv-profile-tip"><FiCheck size={17} /><span>These preferences are stored using the existing investor-profile API.</span></div>
          </aside>
        </div>
        <ToastContainer position="top-right" autoClose={2700} closeOnClick pauseOnHover />
      </div>
    </main>
  );
}
