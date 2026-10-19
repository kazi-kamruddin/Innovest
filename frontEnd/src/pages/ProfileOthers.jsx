import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiArrowRight, FiBriefcase, FiMapPin,
  FiMessageCircle, FiTarget, FiUser, FiUsers,
} from "react-icons/fi";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import { PROFILE_API, moneyText } from "../utils/profileUtils.js";
import {
  InterestPills, ProfileAvatar,
  ProfileCard, ProfileFailure, ProfileLoading,
} from "../components/ProfilePrimitives.jsx";
import "../styles/profile-suite.css";

export default function ProfileOthers() {
  const { userId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [knockPending, setKnockPending] = useState(false);
  const [knockError, setKnockError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      setInvestor(null);
      setProfile(null);
      try {
        if (!PROFILE_API) throw new Error("VITE_API_URL is not configured.");
        const [profileResponse, investorResponse] = await Promise.all([
          fetch(`${PROFILE_API}/profile/${encodeURIComponent(userId)}`, { signal: controller.signal }),
          fetch(`${PROFILE_API}/investor-info/public/${encodeURIComponent(userId)}`, { signal: controller.signal }).catch(() => null),
        ]);
        if (profileResponse.status === 404) throw new Error("This member could not be found.");
        if (!profileResponse.ok) throw new Error("Could not load this member's profile.");
        const data = await profileResponse.json();
        if (!data?.user) throw new Error("This member's profile is incomplete.");
        if (controller.signal.aborted) return;
        setProfile(data);
        if (investorResponse?.ok) {
          const investorData = await investorResponse.json();
          if (!controller.signal.aborted) setInvestor(investorData);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Loading member profile failed:", err);
          setError(err.message || "Could not load this profile.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [userId, retryKey]);

  async function handleKnock() {
    if (!user?.id) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (String(user.id) === String(userId)) {
      navigate("/profile");
      return;
    }
    if (knockPending || !profile?.user?.id) return;
    setKnockError("");
    setKnockPending(true);
    try {
      const token = localStorage.getItem("token");
      if (!token || !PROFILE_API) throw new Error("Please sign in again to start a conversation.");
      const response = await fetch(`${PROFILE_API}/conversations/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: Number(profile.user.id) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.id) throw new Error(data.error || "Could not start this conversation.");
      navigate(`/messages?conversation=${encodeURIComponent(data.id)}`);
    } catch (error) {
      setKnockError(error.message || "Could not start this conversation.");
    } finally {
      setKnockPending(false);
    }
  }

  if (loading) return <ProfileLoading message="Loading member profile…" />;
  if (error) return <ProfileFailure title="Profile unavailable" message={error} onRetry={() => setRetryKey((k) => k + 1)}><Link className="iv-profile-button iv-profile-button--outline" to="/investor-list">Explore investors</Link></ProfileFailure>;
  if (!profile) return <ProfileFailure title="Profile not found" message="This member's information isn't available." />;

  const fullName = profile.user.name || "Innovest member";
  const isOwnProfile = !!user?.id && String(user.id) === String(profile.user.id);

  return (
    <main className="iv-profile">
      <div className="iv-profile-container">
        <Link to="/investor-list" className="iv-profile-back"><FiArrowLeft size={16} /> Explore investors</Link>
        <div className="iv-profile-page-heading">
          <div>
            <span className="iv-profile-eyebrow"><span /> INNOVEST COMMUNITY</span>
            <h1>Member <em>profile.</em></h1>
            <p>Learn more about this member and discover ways to connect.</p>
          </div>
          {isOwnProfile ? (
            <Link to="/profile" className="iv-profile-button iv-profile-button--solid"><FiUser size={16} /> My dashboard</Link>
          ) : (
            <button className="iv-profile-button iv-profile-button--solid" type="button" onClick={handleKnock} disabled={knockPending}>
              <FiMessageCircle size={16} />
              {knockPending ? "Opening conversation…" : !user?.id ? "Sign in to connect" : "Knock / Message"}
            </button>
          )}
        </div>
        {knockError && <p className="iv-profile-form-error" role="alert">{knockError}</p>}

        <div className="iv-profile-layout">
          <div className="iv-profile-main">
            <section className="iv-profile-hero">
              <div className="iv-profile-hero__accent" aria-hidden="true" />
              <div className="iv-profile-hero__identity">
                <ProfileAvatar name={fullName} large />
                <div className="iv-profile-hero__copy">
                  <span className="iv-profile-kicker">INNOVEST MEMBER</span>
                  <h2>{fullName}</h2>
                  <div className="iv-profile-hero__meta">
                    {profile.location && <span><FiMapPin size={15} /> {profile.location}</span>}
                    <span className="iv-profile-tag">{investor ? "Investor" : "Member"}</span>
                  </div>
                </div>
              </div>
            </section>

            <ProfileCard icon={FiUser} title="About" subtitle="A little more about this member">
              <p className="iv-profile-paragraph">{profile.about || "This member hasn't added an introduction yet."}</p>
            </ProfileCard>

            <ProfileCard icon={FiTarget} title="Areas of interest" subtitle="Topics and industries they follow">
              <InterestPills items={profile.areas_of_interest} />
            </ProfileCard>

            {investor && (
              <ProfileCard icon={FiBriefcase} title="Investment preferences" subtitle="Interests and investment range shared by this investor">
                <div className="iv-profile-info-grid">
                  <div className="iv-profile-info-cell"><span>Minimum investment</span><strong>{moneyText(investor.investment_range_min)}</strong></div>
                  <div className="iv-profile-info-cell"><span>Maximum investment</span><strong>{moneyText(investor.investment_range_max)}</strong></div>
                </div>
                <h3 className="iv-profile-mini-heading">Preferred industries</h3>
                <InterestPills items={investor.preferred_industries} />
                <h3 className="iv-profile-mini-heading">Fields of interest</h3>
                <InterestPills items={investor.fields_of_interest} />
              </ProfileCard>
            )}
          </div>

          <aside className="iv-profile-side">
            <ProfileCard icon={FiUser} title="Member details" subtitle="Connect through Innovest messages">
              <dl className="iv-profile-detail-list">
                <div><dt><FiMessageCircle size={15} /> Contact</dt><dd>Use Knock / Message</dd></div>
                <div><dt><FiMapPin size={15} /> Location</dt><dd>{profile.location || "Not provided"}</dd></div>
              </dl>
            </ProfileCard>

            <div className="iv-profile-feature">
              <span className="iv-profile-feature__icon"><FiMessageCircle size={21} /></span>
              <span className="iv-profile-kicker">CONNECT ON INNOVEST</span>
              <h3>Start a conversation.</h3>
              <p>Use Knock to open a conversation with this member using Innovest&apos;s existing messaging system.</p>
              {isOwnProfile ? <Link className="iv-profile-button iv-profile-button--solid" to="/messages">Go to messages <FiArrowRight size={16} /></Link> :
                <button className="iv-profile-button iv-profile-button--solid" type="button" onClick={handleKnock} disabled={knockPending}>
                  {knockPending ? "Opening…" : !user?.id ? "Sign in to connect" : "Knock / Message"} <FiArrowRight size={16} />
                </button>}
            </div>

            <ProfileCard icon={FiUsers} title="Explore more" subtitle="Find opportunities around Innovest">
              <div className="iv-profile-quick-links">
                <Link to="/investor-list"><FiUsers size={16} /> Investor directory <FiArrowRight size={15} /></Link>
                <Link to="/pitches"><FiBriefcase size={16} /> Browse pitches <FiArrowRight size={15} /></Link>
              </div>
            </ProfileCard>
          </aside>
        </div>
      </div>
    </main>
  );
}
