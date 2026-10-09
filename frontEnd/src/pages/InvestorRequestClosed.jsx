import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBriefcase,
  FiCalendar,
  FiInbox,
  FiLock,
  FiRefreshCw,
  FiRotateCcw,
  FiSearch,
  FiShield,
  FiX,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  InvestorRequestConfirmDialog,
  InvestorRequestHeader,
  InvestorRequestState,
  investmentRange,
  readableDate,
} from "../components/InvestorRequestForm";
import "../styles/investor-request-flow.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

function ClosedRequestCard({ request, onReopen }) {
  return (
    <article className="iv-irf-request-card">
      <div className="iv-irf-request-banner">
        <span className="iv-irf-category-badge"><FiBriefcase size={14} /> {request.category || "Other"}</span>
        <span className="iv-irf-closed-badge"><FiLock size={13} /> Closed</span>
      </div>
      <div className="iv-irf-request-body">
        <h3>{request.title || "Untitled request"}</h3>
        <p className="iv-irf-request-description">{request.description || "No details provided."}</p>
        <div className="iv-irf-request-budget">
          <span>INVESTMENT RANGE</span>
          <strong>{investmentRange(request)}</strong>
        </div>
        <div className="iv-irf-request-date"><FiCalendar size={14} /> Last updated {readableDate(request.updatedAt || request.createdAt)}</div>
        <div className="iv-irf-request-actions">
          <button type="button" className="iv-irf-request-main-button" onClick={() => onReopen(request)}>
            <FiRotateCcw size={16} /> Reopen request <FiArrowRight size={16} />
          </button>
          <Link className="iv-irf-request-secondary-button" to={`/investor-request/${request.id}/response-pitches`}>
            Responses <FiArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function InvestorRequestClosed() {
  const { user } = useAuthContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reopening, setReopening] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setRequests([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    async function fetchRequests() {
      setLoading(true);
      setLoadError("");
      try {
        const token = localStorage.getItem("token")?.trim();
        if (!token || !API_BASE) throw new Error("Session or API configuration is unavailable.");
        const response = await fetch(`${API_BASE}/investor-request/my-closed`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        const data = await response.json().catch(() => ([]));
        if (!response.ok) throw new Error(data.error || "Could not load your closed requests.");
        if (!Array.isArray(data)) throw new Error("Unexpected response from the server.");
        if (!controller.signal.aborted) setRequests(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Closed request retrieval failed:", error);
          setLoadError(error.message || "Could not load closed requests.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchRequests();
    return () => controller.abort();
  }, [user?.id, retryKey]);

  const categories = useMemo(() =>
    [...new Set(requests.map((request) => request.category).filter(Boolean))].sort(),
  [requests]);

  const visibleRequests = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = requests.filter((request) => {
      const matchText = !term || [request.title, request.description, request.category]
        .some((value) => String(value ?? "").toLowerCase().includes(term));
      return matchText && (category === "all" || request.category === category);
    });
    const dateValue = (value) => {
      const date = Date.parse(value.updatedAt || value.createdAt || "");
      return Number.isFinite(date) ? date : Number(value.id) || 0;
    };
    const rangeWidth = (request) => {
      const min = Number(request.minInvestment) || 0;
      const max = Number(request.maxInvestment) || 0;
      return max - min;
    };
    filtered.sort((a, b) => {
      if (sortBy === "oldest") return dateValue(a) - dateValue(b);
      if (sortBy === "rangeAsc") return rangeWidth(a) - rangeWidth(b);
      if (sortBy === "rangeDesc") return rangeWidth(b) - rangeWidth(a);
      return dateValue(b) - dateValue(a);
    });
    return filtered;
  }, [requests, query, category, sortBy]);

  const hasFilters = Boolean(query.trim() || category !== "all" || sortBy !== "recent");
  const clearFilters = () => { setQuery(""); setCategory("all"); setSortBy("recent"); };

  async function reopenRequest() {
    if (!selectedRequest || reopening) return;
    setReopening(true);
    try {
      const token = localStorage.getItem("token")?.trim();
      if (!token || !API_BASE) throw new Error("Session or API configuration is unavailable.");
      const response = await fetch(`${API_BASE}/investor-request/${selectedRequest.id}/reopen`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not reopen this request.");
      setRequests((current) => current.filter((request) => request.id !== selectedRequest.id));
      setSelectedRequest(null);
      toast.success("Request reopened. It's back in the open requests feed.");
    } catch (error) {
      console.error("Reopen request failed:", error);
      toast.error(error.message || "Could not reopen this request.");
    } finally {
      setReopening(false);
    }
  }

  return (
    <main className="iv-irf-page">
      <div className="iv-irf-container">
        <InvestorRequestHeader eyebrow="INVESTOR WORKSPACE" title="Your closed" accent="requests."
          description="Review previous requests and reopen them whenever you're ready to hear from entrepreneurs again."
          actions={<Link className="iv-irf-secondary" to="/investor-request"><FiArrowRight size={16} /> Open requests</Link>} />

        {!user?.id ? (
          <InvestorRequestState icon={FiShield} title="Sign in to see your requests" description="Closed investment requests are available to their owners after sign-in."
            action={<Link to="/login" className="iv-irf-primary">Sign in <FiArrowRight size={16} /></Link>} />
        ) : (
          <>
            <section className="iv-irf-toolbar" aria-label="Filter closed requests">
              <div className="iv-irf-toolbar-heading">
                <h2>Closed requests</h2>
                <span>{loading ? "Loading..." : `${requests.length} total`}</span>
              </div>
              <div className="iv-irf-filters">
                <label className="iv-irf-search">
                  <FiSearch size={17} aria-hidden="true" />
                  <span className="iv-irf-sr-only">Search closed requests</span>
                  <input type="search" placeholder="Search closed requests..." value={query} onChange={(event) => setQuery(event.target.value)} />
                </label>
                <label>
                  <span className="iv-irf-sr-only">Filter by category</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option value="all">All categories</option>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span className="iv-irf-sr-only">Sort closed requests</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    <option value="recent">Recently closed</option>
                    <option value="oldest">Oldest first</option>
                    <option value="rangeAsc">Narrowest range</option>
                    <option value="rangeDesc">Widest range</option>
                  </select>
                </label>
              </div>
              {hasFilters && (
                <button type="button" className="iv-irf-reset" onClick={clearFilters}><FiX size={14} /> Clear filters</button>
              )}
            </section>

            {loading ? (
              <div className="iv-irf-cards" aria-label="Loading requests" role="status">
                {[0, 1].map((n) => <div key={n} className="iv-irf-loading-card" />)}
              </div>
            ) : loadError ? (
              <InvestorRequestState icon={FiRefreshCw} title="Couldn't load closed requests" description={loadError} retry={() => setRetryKey((value) => value + 1)} />
            ) : visibleRequests.length ? (
              <div className="iv-irf-cards">
                {visibleRequests.map((request) => <ClosedRequestCard key={request.id} request={request} onReopen={setSelectedRequest} />)}
              </div>
            ) : (
              <InvestorRequestState icon={FiInbox} title={hasFilters ? "No matching requests" : "No closed requests yet"}
                description={hasFilters ? "Try a different search or clear the filters." : "Requests you close will appear here. You can reopen them at any time."}
                action={hasFilters ? <button type="button" className="iv-irf-primary" onClick={clearFilters}>Clear filters <FiArrowRight size={16} /></button>
                  : <Link className="iv-irf-primary" to="/investor-request">Explore open requests <FiArrowRight size={16} /></Link>} />
            )}
          </>
        )}
      </div>
      {selectedRequest && (
        <InvestorRequestConfirmDialog
          icon={FiRotateCcw} title="Reopen this request?"
          description={`“${selectedRequest.title || "This request"}” will become visible in the open requests feed again.`}
          confirmLabel="Reopen request" busy={reopening} onConfirm={reopenRequest}
          onCancel={() => setSelectedRequest(null)} />
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}
