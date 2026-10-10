import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiEdit2, FiMapPin, FiSave, FiTarget, FiUser } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import {
  PROFILE_API, csvItems, InterestPicker, InterestPills, ProfileAvatar,
  ProfileCard, ProfileFailure, ProfileLoading,
} from "../components/ProfilePrimitives.jsx";
import "../styles/profile-suite.css";

const interestOptions = [
  "Technology", "Healthcare", "Finance", "Real Estate", "Education", "Food & Beverage",
];

const emptyForm = { location: "", areas_of_interest: "", about: "" };

export default function ProfileEdit() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const redirectTimer = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (!PROFILE_API) throw new Error("VITE_API_URL is not configured.");
        const response = await fetch(`${PROFILE_API}/profile/${encodeURIComponent(user.id)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load your profile information.");
        const data = await response.json();
        if (!controller.signal.aborted) {
          setForm({
            location: data.location || "",
            areas_of_interest: data.areas_of_interest || "",
            about: data.about || "",
          });
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message || "Could not load your details.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [user?.id, retryKey]);

  const selected = csvItems(form.areas_of_interest);

  function toggleInterest(value) {
    const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
    setForm((prev) => ({ ...prev, areas_of_interest: next.join(", ") }));
  }

  async function handleSave(event) {
    event.preventDefault();
    if (saving || !user?.id) return;
    setSaving(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(`${PROFILE_API}/profile/${encodeURIComponent(user.id)}/edit-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: user.id,
          location: form.location.trim(),
          areas_of_interest: selected.join(", "),
          about: form.about.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || "Unable to save your profile.");
      toast.success("Profile updated successfully.");
      redirectTimer.current = setTimeout(() => navigate("/profile"), 850);
    } catch (err) {
      console.error("Saving profile failed:", err);
      setSubmitError(err.message || "Unable to save your profile.");
      toast.error("Couldn't save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ProfileLoading message="Preparing your profile editor…" />;
  if (error) return <ProfileFailure message={error} onRetry={() => setRetryKey((k) => k + 1)}><Link to="/profile" className="iv-profile-button iv-profile-button--outline">Back to profile</Link></ProfileFailure>;

  return (
    <main className="iv-profile">
      <div className="iv-profile-container">
        <Link to="/profile" className="iv-profile-back"><FiArrowLeft size={16} /> Back to profile</Link>
        <div className="iv-profile-page-heading">
          <div>
            <span className="iv-profile-eyebrow"><span /> YOUR WORKSPACE</span>
            <h1>Edit your <em>profile.</em></h1>
            <p>Share your background and choose what you&apos;d like to discover on Innovest.</p>
          </div>
        </div>

        <div className="iv-profile-layout iv-profile-layout--editor">
          <div className="iv-profile-main">
            <form onSubmit={handleSave} noValidate>
              <ProfileCard icon={FiEdit2} title="Your information" subtitle="Help others get to know you">
                <div className="iv-profile-fields">
                  <label className="iv-profile-field">
                    <span><FiMapPin size={15} /> Location</span>
                    <input type="text" name="location" placeholder="e.g. Dhaka, Bangladesh" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
                  </label>

                  <div className="iv-profile-field">
                    <span id="iv-profile-interests-label"><FiTarget size={15} /> Areas of interest</span>
                    <p className="iv-profile-field-help">Select as many as you like.</p>
                    <div role="group" aria-labelledby="iv-profile-interests-label">
                      <InterestPicker options={interestOptions} selected={selected} onToggle={toggleInterest} />
                    </div>
                  </div>

                  <label className="iv-profile-field">
                    <span><FiUser size={15} /> About</span>
                    <textarea rows={6} name="about" placeholder="Share what you do, what you're building, or what interests you…" value={form.about} onChange={(e) => setForm((prev) => ({ ...prev, about: e.target.value }))} />
                    <span className="iv-profile-field-help">This introduction will be visible on your public profile.</span>
                  </label>
                </div>
              </ProfileCard>

              {submitError && <p className="iv-profile-form-error" role="alert">{submitError}</p>}

              <div className="iv-profile-form-actions">
                <Link to="/profile" className="iv-profile-button iv-profile-button--outline">Cancel</Link>
                <button type="submit" className="iv-profile-button iv-profile-button--solid" disabled={saving}>
                  {saving ? "Saving…" : <><FiSave size={16} /> Save changes</>}
                </button>
              </div>
            </form>
          </div>

          <aside className="iv-profile-side">
            <div className="iv-profile-preview-head"><span className="iv-profile-eyebrow"><span /> LIVE PROFILE PREVIEW</span><p>Your public introduction as you edit.</p></div>
            <section className="iv-profile-preview">
              <div className="iv-profile-preview__banner" />
              <div className="iv-profile-preview__inner">
                <ProfileAvatar name={user?.name} />
                <h2>{user?.name || "Your name"}</h2>
                <p className="iv-profile-preview__location"><FiMapPin size={14} /> {form.location.trim() || "Your location"}</p>
                <div className="iv-profile-preview__divider" />
                <span className="iv-profile-kicker">ABOUT</span>
                <p className="iv-profile-preview__bio">{form.about.trim() || "Your introduction will appear here."}</p>
                <span className="iv-profile-kicker">AREAS OF INTEREST</span>
                <InterestPills items={selected} empty="Select industries to preview them here." />
              </div>
            </section>
            <div className="iv-profile-tip"><FiCheck size={17} /><span>Changes are saved to your existing profile. Your account name and email remain unchanged.</span></div>
          </aside>
        </div>
        <ToastContainer position="top-right" autoClose={2300} closeOnClick pauseOnHover />
      </div>
    </main>
  );
}
