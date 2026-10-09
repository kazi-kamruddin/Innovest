import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBriefcase,
  FiDollarSign,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useAuthContext } from "../hooks/useAuthContext";
import "../styles/investor-list.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const moneyFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function asList(value) {
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function numericValue(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const n = Number(String(value).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function currency(value) {
  const n = numericValue(value);
  return n === null ? "—" : `$${moneyFormatter.format(n)}`;
}

function InvestmentRange({ minimum, maximum }) {
  const hasMin = numericValue(minimum) !== null;
  const hasMax = numericValue(maximum) !== null;
  if (!hasMin && !hasMax) return <strong>Not specified</strong>;
  return (
    <strong>
      {hasMin ? currency(minimum) : "—"}
      <span aria-label="to"> – </span>
      {hasMax ? currency(maximum) : "—"}
    </strong>
  );
}

function InvestorCard({ investor }) {
  const industries = asList(investor.preferred_industries);
  const fields = asList(investor.fields_of_interest);
  const profileId = investor.user_id ?? investor.id;
  const name = investor.name || "Innovest investor";
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "IN";

  return (
    <article className="iv-investor-card">
      <div className="iv-investor-card-head">
        <div className="iv-investor-avatar" aria-hidden="true">{initials}</div>
        <div className="iv-investor-identity">
          <span className="iv-investor-label">INVESTOR PROFILE</span>
          <h3>{name}</h3>
        </div>
        <span className="iv-investor-corner-icon" aria-hidden="true"><FiBriefcase size={19} /></span>
      </div>
      <div className="iv-investor-card-body">
        <div className="iv-investor-range">
          <span><FiDollarSign size={14} aria-hidden="true" /> INVESTMENT RANGE</span>
          <InvestmentRange minimum={investor.investment_range_min} maximum={investor.investment_range_max} />
        </div>
        <div className="iv-investor-card-section">
          <h4>Preferred industries</h4>
          <div className="iv-investor-chips">
            {industries.length ? industries.map((item) => <span className="iv-investor-chip" key={item}>{item}</span>) : <span className="iv-investor-placeholder">Not specified</span>}
          </div>
        </div>
        <div className="iv-investor-card-section">
          <h4>Fields of interest</h4>
          <p>{fields.length ? fields.join(" · ") : "Not specified"}</p>
        </div>
        <Link className="iv-investor-view-button" to={`/profile/${profileId}`} aria-label={`View ${name}'s profile`}>
          View investor profile <FiArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="iv-investor-card iv-investor-skeleton" aria-hidden="true">
      <div className="iv-investor-card-head"><span className="iv-investor-skeleton-block iv-investor-skeleton-avatar" /><span className="iv-investor-skeleton-block iv-investor-skeleton-name" /></div>
      <div className="iv-investor-card-body"><span className="iv-investor-skeleton-block iv-investor-skeleton-line" /><span className="iv-investor-skeleton-block iv-investor-skeleton-big" /><span className="iv-investor-skeleton-block iv-investor-skeleton-line" /><span className="iv-investor-skeleton-block iv-investor-skeleton-button" /></div>
    </div>
  );
}

export default function InvestorList() {
  const { user } = useAuthContext();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (!API_BASE) throw new Error("VITE_API_URL is not configured.");
        const response = await fetch(`${API_BASE}/investor-info/investor-list`, { signal: controller.signal });
        // This existing endpoint returns HTTP 404 when there are no investor profiles.
        if (response.status === 404) {
          if (!controller.signal.aborted) setInvestors([]);
          return;
        }
        if (!response.ok) throw new Error(`Unable to load investors (${response.status}).`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected investor directory response.");
        if (!controller.signal.aborted) setInvestors(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Unable to load investor directory:", err);
          setError("We couldn't load investors right now. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [retryKey]);

  const availableInvestors = useMemo(
    () => investors.filter((investor) => String(investor.user_id) !== String(user?.id)),
    [investors, user?.id]
  );

  const industries = useMemo(
    () => [...new Set(availableInvestors.flatMap((investor) => asList(investor.preferred_industries)))].sort((a, b) => a.localeCompare(b)),
    [availableInvestors]
  );

  const visibleInvestors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return availableInvestors
      .filter((investor) => {
        const matchesSearch = !query || [investor.name, investor.preferred_industries, investor.fields_of_interest]
          .some((field) => String(field ?? "").toLowerCase().includes(query));
        const matchesIndustry = industry === "all" || asList(investor.preferred_industries).includes(industry);
        return matchesSearch && matchesIndustry;
      })
      .sort((a, b) => {
        if (sortBy === "minimum") {
          const aMin = numericValue(a.investment_range_min);
          const bMin = numericValue(b.investment_range_min);
          if (aMin === null) return bMin === null ? 0 : 1;
          if (bMin === null) return -1;
          return aMin - bMin;
        }
        if (sortBy === "maximum") {
          const aMax = numericValue(a.investment_range_max);
          const bMax = numericValue(b.investment_range_max);
          if (aMax === null) return bMax === null ? 0 : 1;
          if (bMax === null) return -1;
          return bMax - aMax;
        }
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [availableInvestors, search, industry, sortBy]);

  function clearFilters() { setSearch(""); setIndustry("all"); setSortBy("name"); }
  const hasActiveFilters = search.trim() !== "" || industry !== "all" || sortBy !== "name";

  return (
    <main className="iv-investor">
      <div className="iv-investor-container">
        <header className="iv-investor-intro">
          <div>
            <p className="iv-investor-eyebrow"><span aria-hidden="true" /> INNOVEST DIRECTORY</p>
            <h1>Discover your next <em>connection.</em></h1>
            <p>Explore investor profiles, find shared interests, and open the door to a conversation.</p>
          </div>
          <Link className="iv-investor-pitch-link" to="/pitches">Browse pitches <FiArrowUpRight size={16} aria-hidden="true" /></Link>
        </header>

        <section className="iv-investor-filters" aria-label="Find investors">
          <div className="iv-investor-filter-title"><FiSliders size={17} aria-hidden="true" /><h2>Explore investors</h2></div>
          <div className="iv-investor-filter-grid">
            <label className="iv-investor-field iv-investor-field-search">
              <span>Search investors</span>
              <div className="iv-investor-input-wrap"><FiSearch size={16} aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, interests or industry" /></div>
            </label>
            <label className="iv-investor-field"><span>Industry</span><select value={industry} onChange={(event) => setIndustry(event.target.value)}><option value="all">All industries</option>{industries.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label className="iv-investor-field"><span>Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="name">Name (A–Z)</option><option value="minimum">Minimum investment (low first)</option><option value="maximum">Maximum investment (high first)</option></select></label>
          </div>
        </section>

        <div className="iv-investor-results-heading">
          <div><h2>Investor directory</h2><p>View investor preferences and visit their public profiles.</p></div>
          {!loading && !error && <span className="iv-investor-count">{visibleInvestors.length} {visibleInvestors.length === 1 ? "investor" : "investors"}</span>}
        </div>

        {loading ? (
          <div className="iv-investor-grid" role="status" aria-label="Loading investors"><SkeletonCard /><SkeletonCard /></div>
        ) : error ? (
          <div className="iv-investor-state" role="alert">
            <div className="iv-investor-state-icon"><FiRefreshCw size={23} aria-hidden="true" /></div>
            <h2>Couldn&apos;t load the directory</h2><p>{error}</p>
            <button className="iv-investor-state-button" type="button" onClick={() => setRetryKey((key) => key + 1)}><FiRefreshCw size={16} aria-hidden="true" /> Try again</button>
          </div>
        ) : visibleInvestors.length ? (
          <div className="iv-investor-grid">{visibleInvestors.map((investor) => <InvestorCard key={investor.user_id ?? investor.id} investor={investor} />)}</div>
        ) : (
          <div className="iv-investor-state">
            <div className="iv-investor-state-icon"><FiUsers size={24} aria-hidden="true" /></div>
            <h2>{hasActiveFilters ? "No matching investors" : "No investors to show yet"}</h2>
            <p>{hasActiveFilters ? "Try a different search or industry." : "Profiles will appear here when investors share their preferences."}</p>
            {hasActiveFilters ? (
              <button className="iv-investor-state-button" type="button" onClick={clearFilters}><FiX size={16} aria-hidden="true" /> Clear filters</button>
            ) : (
              <Link className="iv-investor-state-button" to="/pitches">Explore pitches <FiArrowRight size={16} aria-hidden="true" /></Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
