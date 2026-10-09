import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBriefcase,
  FiDollarSign,
  FiInbox,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  InvestorRequestHeader,
  InvestorRequestState,
  moneyText,
} from "../components/InvestorRequestForm";
import "../styles/investor-request-flow.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

function PitchResponseCard({ pitch }) {
  const location = [pitch.company_location, pitch.country].filter(Boolean).join(", ");
  return (
    <article className="iv-irf-response-card">
      <div className="iv-irf-request-banner">
        <span className="iv-irf-category-badge"><FiBriefcase size={14} /> {pitch.industry || "Business pitch"}</span>
        {pitch.stage && <span className="iv-irf-stage-badge">{pitch.stage}</span>}
      </div>
      <div className="iv-irf-response-body">
        <h3>{pitch.title || "Untitled pitch"}</h3>
        {location && <p className="iv-irf-response-location"><FiMapPin size={14} /> {location}</p>}
        <p className="iv-irf-response-description">{pitch.the_business || "No business overview provided."}</p>
        <div className="iv-irf-response-amounts">
          <div><span>RAISING GOAL</span><strong>{moneyText(pitch.total_raising_amount) || "Not specified"}</strong></div>
          <div><span>MIN. INVESTMENT</span><strong>{moneyText(pitch.minimum_investment) || "Not specified"}</strong></div>
        </div>
        <div className="iv-irf-response-founder">
          <span className="iv-irf-response-avatar"><FiUser size={17} aria-hidden="true" /></span>
          <div>
            <span>Entrepreneur</span>
            <strong>{pitch.name || "Pitch creator"}</strong>
            {pitch.email && <span className="iv-irf-founder-email">{pitch.email}</span>}
          </div>
        </div>
        <Link to={`/pitches/${pitch.id}`} className="iv-irf-request-main-button">
          View pitch details <FiArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function InvestorRequestAllResponses() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [pitches, setPitches] = useState([]);
  const [requestTitle, setRequestTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    async function loadResponsePitches() {
      setLoading(true);
      setError("");
      setRequestTitle("");
      try {
        const token = localStorage.getItem("token")?.trim();
        if (!token || !API_BASE) throw new Error("Session or API configuration is unavailable.");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await fetch(`${API_BASE}/investor-request/${encodeURIComponent(id)}/pitches`, {
          headers, signal: controller.signal,
        });
        const data = await response.json().catch(() => ([]));
        if (!response.ok) throw new Error(data.error || "Could not retrieve response pitches.");
        if (!Array.isArray(data)) throw new Error("Unexpected response from the server.");
        if (!controller.signal.aborted) setPitches(data);

        // Contextual title is optional: a failed title lookup does not hide the pitches.
        try {
          const requestResponse = await fetch(`${API_BASE}/investor-request/${encodeURIComponent(id)}`, {
            headers, signal: controller.signal,
          });
          if (requestResponse.ok) {
            const requestData = await requestResponse.json();
            if (!controller.signal.aborted) setRequestTitle(requestData.title || "");
          }
        } catch (lookupError) {
          if (!controller.signal.aborted) console.warn("Request title unavailable:", lookupError);
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          console.error("Unable to load response pitches:", fetchError);
          setError(fetchError.message || "Unable to load response pitches.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadResponsePitches();
    return () => controller.abort();
  }, [id, user?.id, retryKey]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return pitches.filter((pitch) => !term || [pitch.title, pitch.the_business, pitch.industry, pitch.name]
      .some((field) => String(field ?? "").toLowerCase().includes(term)));
  }, [pitches, query]);

  return (
    <main className="iv-irf-page">
      <div className="iv-irf-container">
        <InvestorRequestHeader
          eyebrow="INVESTOR CONNECTIONS"
          title="Pitch" accent="responses."
          description={requestTitle ? `Entrepreneur pitches submitted for “${requestTitle}”.` : `Explore pitches submitted to request #${id}.`}
          actions={!loading && !error ? <span className="iv-irf-results-pill">{pitches.length} {pitches.length === 1 ? "response" : "responses"}</span> : null}
        />

        {!user?.id ? (
          <InvestorRequestState icon={FiShield} title="Sign in to view responses" description="Pitch responses are available to signed-in users."
            action={<Link to="/login" className="iv-irf-primary">Sign in <FiArrowRight size={16} /></Link>} />
        ) : loading ? (
          <div className="iv-irf-cards" role="status" aria-label="Loading response pitches">
            {[0, 1].map((n) => <div className="iv-irf-loading-card" key={n} />)}
          </div>
        ) : error ? (
          <InvestorRequestState icon={FiRefreshCw} title="Couldn't load the responses" description={error} retry={() => setRetryKey((value) => value + 1)} />
        ) : pitches.length === 0 ? (
          <InvestorRequestState icon={FiInbox} title="No response pitches yet" description="When entrepreneurs respond to this investor request, their pitches will appear here."
            action={<Link to="/investor-request" className="iv-irf-primary">Explore requests <FiArrowRight size={16} /></Link>} />
        ) : (
          <>
            <div className="iv-irf-responses-toolbar">
              <div><FiDollarSign size={17} /><span>{visible.length} matching pitches</span></div>
              <label className="iv-irf-search">
                <FiSearch size={17} aria-hidden="true" />
                <span className="iv-irf-sr-only">Search response pitches</span>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search responses..." />
              </label>
            </div>
            {visible.length > 0 ? (
              <div className="iv-irf-cards">
                {visible.map((pitch) => <PitchResponseCard key={pitch.id} pitch={pitch} />)}
              </div>
            ) : (
              <InvestorRequestState icon={FiSearch} title="No matching pitches" description="Try a different name, industry or keyword."
                action={<button type="button" className="iv-irf-primary" onClick={() => setQuery("")}>Clear search <FiArrowRight size={16} /></button>} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
