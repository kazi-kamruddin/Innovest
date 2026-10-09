import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FiArrowLeft, FiArrowRight, FiBriefcase, FiMail, FiMapPin,
  FiMessageCircle, FiTarget, FiUser, FiUsers,
} from "react-icons/fi";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import {
  PROFILE_API, InterestPills, moneyText, ProfileAvatar,
  ProfileCard, ProfileFailure, ProfileLoading,
} from "../components/ProfilePrimitives.jsx";
import "../styles/profile-suite.css";

export default function ProfileOthers() {
  const { userId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const knockPendingRef = useRef(false);
  const knockTimerRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user?.id || !token || !PROFILE_API || String(user.id) === String(userId)) return;
    const socket = io(PROFILE_API, { auth: { token }, reconnection: true });
    socketRef.current = socket;
    setSocketConnected(socket.connected);

    const handleConnect = () => { setSocketConnected(true); setKnockError(""); };
    const handleDisconnect = () => {
      clearTimeout(knockTimerRef.current);
      setSocketConnected(false);
      knockPendingRef.current = false;
      setKnockPending(false);
    };
    const handleConnectError = () => {
      clearTimeout(knockTimerRef.current);
      setSocketConnected(false);
      knockPendingRef.current = false;
      setKnockPending(false);
      setKnockError("Messaging is temporarily unavailable. Please try again shortly.");
    };
    const handleNewConversation = ({ partnerId } = {}) => {
      // Never redirect when another person knocks unexpectedly.
      if (knockPendingRef.current && String(partnerId) === String(userId)) {
        clearTimeout(knockTimerRef.current);
        knockPendingRef.current = false;
        setKnockPending(false);
        navigate("/messages");
      }
    };
    const handleKnockError = ({ message } = {}) => {
      clearTimeout(knockTimerRef.current);
      knockPendingRef.current = false;
      setKnockPending(false);
      setKnockError(message || "Could not start this conversation.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("new_conversation", handleNewConversation);
    socket.on("knock_error", handleKnockError);

    return () => {
      clearTimeout(knockTimerRef.current);
      knockPendingRef.current = false;
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [user?.id, userId, navigate]);

  function handleKnock() {
    if (!user?.id) {
      navigate("/login");
      return;
    }
    if (String(user.id) === String(userId)) {
      navigate("/profile");
      return;
    }
    if (!socketRef.current?.connected) {
      setKnockError("The messaging connection isn't ready. Please try again in a moment.");
      return;
    }
    if (knockPendingRef.current || !profile?.user?.id) return;
    setKnockError("");
    knockPendingRef.current = true;
    setKnockPending(true);
    socketRef.current.emit("knock_user", { receiverId: Number(profile.user.id) });
    clearTimeout(knockTimerRef.current);
    knockTimerRef.current = setTimeout(() => {
      if (!knockPendingRef.current) return;
      knockPendingRef.current = false;
      setKnockPending(false);
      setKnockError("The request timed out. Please try again.");
    }, 10000);
  }

  if (loading) return <ProfileLoading message="Loading member profile…" />;
  if (error) return <ProfileFailure title="Profile unavailable" message={error} onRetry={() => setRetryKey((k) => k + 1)}><Link className="iv-profile-button iv-profile-button--outline" to="/investor-list">Explore investors</Link></ProfileFailure>;
  if (!profile) return <ProfileFailure title="Profile not found" message="This member's information isn't available." />;

  const fullName = profile.user.name || "Innovest member";
  const isOwnProfile = !!user?.id && String(user.id) === String(profile.user.id);
  const email = profile.user.email;

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
              {knockPending ? "Opening conversation…" : !user?.id ? "Sign in to connect" : !socketConnected ? "Try to connect" : "Knock / Message"}
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
            <ProfileCard icon={FiUser} title="Member details" subtitle="Contact and location information">
              <dl className="iv-profile-detail-list">
                <div><dt><FiMail size={15} /> Email</dt><dd>{email ? <a href={`mailto:${email}`}>{email}</a> : "Not available"}</dd></div>
                <div><dt><FiMapPin size={15} /> Location</dt><dd>{profile.location || "Not provided"}</dd></div>
              </dl>
            </ProfileCard>

            <div className="iv-profile-feature">
              <span className="iv-profile-feature__icon"><FiMessageCircle size={21} /></span>
              <span className="iv-profile-kicker">CONNECT ON INNOVEST</span>
              <h3>Start a conversation.</h3>
              <p>Use Knock to open a conversation with this member using Innovest's existing messaging system.</p>
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
