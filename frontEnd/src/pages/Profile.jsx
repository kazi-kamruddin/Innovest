import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight, FiBriefcase, FiEdit2, FiExternalLink,
  FiLogOut, FiMail, FiMapPin, FiMessageCircle, FiTarget, FiUser, FiUsers,
} from "react-icons/fi";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import { useLogout } from "../hooks/useLogout.jsx";
import {
  PROFILE_API, csvItems, InterestPills, moneyText, ProfileAvatar,
  ProfileCard, ProfileFailure, ProfileLoading,
} from "../components/ProfilePrimitives.jsx";
import "../styles/profile-suite.css";

export default function Profile() {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      setInvestor(null);
      try {
        if (!PROFILE_API) throw new Error("VITE_API_URL is not configured.");
        const token = localStorage.getItem("token");
        const [profileResponse, investorResponse] = await Promise.all([
          fetch(`${PROFILE_API}/profile/${encodeURIComponent(user.id)}`, { signal: controller.signal }),
          fetch(`${PROFILE_API}/investor-info/${encodeURIComponent(user.id)}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: controller.signal,
          }).catch(() => null),
        ]);

        if (!profileResponse.ok) throw new Error("Your profile could not be loaded.");
        const profileData = await profileResponse.json();
        if (!profileData?.user) throw new Error("Your profile data is incomplete.");
        if (controller.signal.aborted) return;
        setProfile(profileData);
        // A 404 here is normal: not every user has investor preferences.
        if (investorResponse?.ok) {
          const investorData = await investorResponse.json();
          if (!controller.signal.aborted) setInvestor(investorData);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Profile load error:", err);
          setError(err.message || "Could not load your profile.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [user?.id, retryKey]);

  if (loading) return <ProfileLoading message="Loading your profile…" />;
  if (error) return <ProfileFailure message={error} onRetry={() => setRetryKey((k) => k + 1)} />;
  if (!profile) return <ProfileFailure message="We couldn't find this account." />;

  const fullName = profile.user.name || user?.name || "Innovest member";
  const email = profile.user.email || user?.email;
  const interests = csvItems(profile.areas_of_interest);
  const completed = [fullName !== "Innovest member", !!profile.location, interests.length > 0, !!profile.about];
  const completedCount = completed.filter(Boolean).length;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="iv-profile">
      <div className="iv-profile-container">
        <div className="iv-profile-page-heading">
          <div>
            <span className="iv-profile-eyebrow"><span /> YOUR WORKSPACE</span>
            <h1>Your <em>profile.</em></h1>
            <p>Manage how you introduce yourself to investors and entrepreneurs.</p>
          </div>
          <Link to="/profile/edit-profile" className="iv-profile-button iv-profile-button--solid"><FiEdit2 size={16} /> Edit profile</Link>
        </div>

        <div className="iv-profile-layout">
          <div className="iv-profile-main">
            <section className="iv-profile-hero">
              <div className="iv-profile-hero__accent" aria-hidden="true" />
              <div className="iv-profile-hero__identity">
                <ProfileAvatar name={fullName} large />
                <div className="iv-profile-hero__copy">
                  <span className="iv-profile-kicker">YOUR INNOVEST IDENTITY</span>
                  <h2>{fullName}</h2>
                  <div className="iv-profile-hero__meta">
                    {profile.location && <span><FiMapPin size={15} /> {profile.location}</span>}
                    <span className="iv-profile-tag">{investor ? "Investor profile active" : "Innovest member"}</span>
                  </div>
                </div>
              </div>
              <div className="iv-profile-hero__actions">
                <Link to={`/profile/${user.id}`} className="iv-profile-link"><FiExternalLink size={15} /> View public profile</Link>
                <Link to="/profile/edit-profile" className="iv-profile-link"><FiEdit2 size={15} /> Update details</Link>
              </div>
            </section>

            <ProfileCard icon={FiUser} title="About you" subtitle="Your introduction to the community">
              <p className="iv-profile-paragraph">{profile.about || "You haven't added an introduction yet. Share a little about yourself to help others understand your background."}</p>
              {!profile.about && <Link className="iv-profile-text-link" to="/profile/edit-profile">Write your bio <FiArrowRight size={15} /></Link>}
            </ProfileCard>

            <ProfileCard icon={FiTarget} title="Areas of interest" subtitle="The industries you follow and explore">
              <InterestPills items={interests} />
            </ProfileCard>

            {investor && (
              <ProfileCard icon={FiBriefcase} title="Your investor preferences" subtitle="Visible as part of your investor profile">
                <div className="iv-profile-info-grid">
                  <div className="iv-profile-info-cell"><span>Minimum investment</span><strong>{moneyText(investor.investment_range_min)}</strong></div>
                  <div className="iv-profile-info-cell"><span>Maximum investment</span><strong>{moneyText(investor.investment_range_max)}</strong></div>
                </div>
                <h3 className="iv-profile-mini-heading">Preferred industries</h3>
                <InterestPills items={investor.preferred_industries} />
                <h3 className="iv-profile-mini-heading">Fields of interest</h3>
                <InterestPills items={investor.fields_of_interest} />
                <Link to="/profile/investor-info" className="iv-profile-text-link">Update investor preferences <FiArrowRight size={15} /></Link>
              </ProfileCard>
            )}
          </div>

          <aside className="iv-profile-side">
            <ProfileCard icon={FiUser} title="Profile details" subtitle="Information tied to your account">
              <dl className="iv-profile-detail-list">
                <div><dt><FiMail size={15} /> Email</dt><dd>{email || "Not available"}</dd></div>
                <div><dt><FiMapPin size={15} /> Location</dt><dd>{profile.location || "Not added"}</dd></div>
                <div><dt><FiTarget size={15} /> Profile basics added</dt><dd>{completedCount} of 4</dd></div>
              </dl>
            </ProfileCard>

            <div className="iv-profile-feature">
              <span className="iv-profile-feature__icon"><FiBriefcase size={21} /></span>
              <span className="iv-profile-kicker">INVESTOR PROFILE</span>
              <h3>{investor ? "Your investing interests, organized." : "Interested in investing?"}</h3>
              <p>{investor ? "Keep your preferred industries and investment range current." : "Set up investment preferences so founders can better understand your interests."}</p>
              <Link to="/profile/investor-info" className="iv-profile-button iv-profile-button--solid">{investor ? "Manage investor profile" : "Set up investor profile"} <FiArrowRight size={16} /></Link>
            </div>

            <ProfileCard icon={FiUsers} title="Quick navigation" subtitle="Continue exploring Innovest">
              <div className="iv-profile-quick-links">
                <Link to="/fundraise-dashboard"><FiBriefcase size={16} /> Your pitches <FiArrowRight size={15} /></Link>
                <Link to="/investor-list"><FiUsers size={16} /> Investor directory <FiArrowRight size={15} /></Link>
                <Link to="/messages"><FiMessageCircle size={16} /> Your messages <FiArrowRight size={15} /></Link>
              </div>
            </ProfileCard>

            <button type="button" className="iv-profile-logout" onClick={handleLogout}><FiLogOut size={17} /> Log out of Innovest</button>
          </aside>
        </div>
      </div>
    </main>
  );
}
