import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiEdit2,
  FiFileText,
  FiInbox,
  FiLock,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiX,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import "../styles/investor-request.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatMoney(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const raw = String(value).trim();
  const amount = Number(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(amount) ? `$${currencyFormatter.format(amount)}` : raw;
}

function investmentRange(request) {
  const minimum = formatMoney(request.minInvestment);
  const maximum = formatMoney(request.maxInvestment);
  if (minimum && maximum) return `${minimum} – ${maximum}`;
  if (minimum) return `From ${minimum}`;
  if (maximum) return `Up to ${maximum}`;
  return "Flexible budget";
}

function timeValue(request) {
  const timestamp = Date.parse(request.createdAt || "");
  return Number.isFinite(timestamp) ? timestamp : Number(request.id) || 0;
}

function rangeWidth(request) {
  const min = Number(request.minInvestment);
  const max = Number(request.maxInvestment);
  return Number.isFinite(max) && Number.isFinite(min) ? max - min : 0;
}

function requestDate(dateString) {
  if (!dateString) return "Recently posted";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "Recently posted"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function RequestCard({ request, mine, onClose }) {
  const responsesLink = `/investor-request/${request.id}/response-pitches`;

  return (
    <article className="iv-ir-card">
      <div className="iv-ir-card-band">
        <span className="iv-ir-category">
          <FiBriefcase size={14} aria-hidden="true" />
          {request.category || "Other"}
        </span>
        <span className="iv-ir-open-badge">
          <span aria-hidden="true" /> Open
        </span>
        <div className="iv-ir-band-ring" aria-hidden="true" />
      </div>

      <div className="iv-ir-card-body">
        <h3>{request.title || "Untitled investment request"}</h3>
        <p className="iv-ir-description">
          {request.description || "No description was provided."}
        </p>

        <div className="iv-ir-card-details">
          <div className="iv-ir-card-investment">
            <span>INVESTMENT RANGE</span>
            <strong>{investmentRange(request)}</strong>
          </div>
          <div className="iv-ir-card-meta">
            <span>
              <FiCalendar size={14} aria-hidden="true" />
              {requestDate(request.createdAt)}
            </span>
            {request.name && (
              <span className="iv-ir-investor-name" title={request.name}>
                {mine ? "Posted by you" : `By ${request.name}`}
              </span>
            )}
          </div>
        </div>

        <div className="iv-ir-card-actions">
          {mine ? (
            <>
              <Link
                to={`/investor-request/edit-request/${request.id}`}
                className="iv-ir-card-main-action"
              >
                <FiEdit2 size={15} aria-hidden="true" /> Edit request
              </Link>
              <Link to={responsesLink} className="iv-ir-card-secondary-action">
                Responses <FiArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="iv-ir-card-close-action"
                aria-label={`Close request: ${request.title || "Untitled request"}`}
                title="Mark as closed"
                onClick={() => onClose(request)}
              >
                <FiX size={18} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link
                to={`/investor-request/create-response-pitch/${request.id}`}
                className="iv-ir-card-main-action"
              >
                Respond with a pitch
                <FiArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to={responsesLink} className="iv-ir-card-secondary-action">
                Responses <FiArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState({ title, description, action, onClear }) {
  return (
    <div className="iv-ir-state">
      <span className="iv-ir-state-icon"><FiInbox size={24} aria-hidden="true" /></span>
      <h2>{title}</h2>
      <p>{description}</p>
      {onClear ? (
        <button type="button" className="iv-ir-primary-button" onClick={onClear}>
          Clear filters <FiArrowRight size={16} aria-hidden="true" />
        </button>
      ) : action}
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="iv-ir-card-grid" role="status" aria-label="Loading investor requests">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="iv-ir-card iv-ir-skeleton" aria-hidden="true">
          <div className="iv-ir-card-band" />
          <div className="iv-ir-card-body">
            <span className="iv-ir-placeholder iv-ir-placeholder-title" />
            <span className="iv-ir-placeholder" />
            <span className="iv-ir-placeholder iv-ir-placeholder-half" />
            <span className="iv-ir-placeholder iv-ir-placeholder-large" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InvestorRequest() {
  const { user } = useAuthContext();
  const [requests, setRequests] = useState([]);
  const [isInvestor, setIsInvestor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [activeTab, setActiveTab] = useState("others");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [closing, setClosing] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    if (!user?.id) {
      setRequests([]);
      setIsInvestor(false);
      setLoading(false);
      return () => controller.abort();
    }

    const token = localStorage.getItem("token")?.trim();
    const headers = { Authorization: `Bearer ${token}` };

    async function fetchData() {
      setLoading(true);
      setFetchError("");
      setIsInvestor(false);
      setActiveTab("others");

      if (!API_BASE || !token) {
        setFetchError("Your session or API configuration is unavailable. Please sign in again if needed.");
        setLoading(false);
        return;
      }

      // The investor-info endpoint determines whether the user can post requests.
      // A missing investor profile is normal for an entrepreneur.
      async function fetchInvestorStatus() {
        try {
          const response = await fetch(`${API_BASE}/investor-info/${user.id}`, {
            headers,
            signal: controller.signal,
          });
          if (!response.ok) return;
          const data = await response.json();
          if (!controller.signal.aborted && data && Object.keys(data).length > 0) {
            setIsInvestor(true);
            setActiveTab("mine");
          }
        } catch (error) {
          if (!controller.signal.aborted) console.warn("Investor status unavailable:", error);
        }
      }

      async function fetchOpenRequests() {
        try {
          const response = await fetch(`${API_BASE}/investor-request`, {
            headers,
            signal: controller.signal,
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          if (!Array.isArray(data)) throw new Error("Unexpected requests response");
          if (!controller.signal.aborted) setRequests(data);
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error("Unable to load investor requests:", error);
            setFetchError("We couldn't load the requests right now. Please try again.");
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      }

      fetchInvestorStatus();
      fetchOpenRequests();
    }

    fetchData();
    return () => controller.abort();
  }, [user?.id, retryKey]);

  const myRequests = useMemo(
    () => requests.filter((request) => String(request.investorId) === String(user?.id)),
    [requests, user?.id]
  );

  const otherRequests = useMemo(
    () => requests.filter((request) => String(request.investorId) !== String(user?.id)),
    [requests, user?.id]
  );

  const categories = useMemo(
    () => [...new Set(requests.map((request) => request.category).filter(Boolean))].sort(),
    [requests]
  );

  const hasFilters = Boolean(query.trim() || category !== "all" || sortBy !== "newest");
  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setSortBy("newest");
  };

  const visibleRequests = useMemo(() => {
    const source = activeTab === "mine" && isInvestor ? myRequests : otherRequests;
    const term = query.trim().toLowerCase();

    return source
      .filter((request) => {
        const matchesText = !term || [request.title, request.description, request.category]
          .some((value) => String(value || "").toLowerCase().includes(term));
        return matchesText && (category === "all" || request.category === category);
      })
      .sort((a, b) => {
        if (sortBy === "oldest") return timeValue(a) - timeValue(b);
        if (sortBy === "rangeAsc") return rangeWidth(a) - rangeWidth(b);
        if (sortBy === "rangeDesc") return rangeWidth(b) - rangeWidth(a);
        return timeValue(b) - timeValue(a);
      });
  }, [activeTab, isInvestor, myRequests, otherRequests, query, category, sortBy]);

  useEffect(() => {
    if (!selectedRequest) return;
    cancelRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !closing) setSelectedRequest(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedRequest, closing]);

  async function closeRequest() {
    if (!selectedRequest || closing || !user?.id) return;
    const token = localStorage.getItem("token")?.trim();
    if (!token) return toast.error("Your session has expired. Please sign in again.");

    setClosing(true);
    try {
      const response = await fetch(
        `${API_BASE}/investor-request/${selectedRequest.id}/close`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Couldn't close request.");
      setRequests((current) => current.filter((r) => String(r.id) !== String(selectedRequest.id)));
      setSelectedRequest(null);
      toast.success("Request marked as closed.");
    } catch (error) {
      console.error("Closing request failed:", error);
      toast.error(error.message || "Couldn't close request.");
    } finally {
      setClosing(false);
    }
  }

  return (
    <main className="iv-ir-page">
      <div className="iv-ir-container">
        <header className="iv-ir-header">
          <div className="iv-ir-heading">
            <p className="iv-ir-eyebrow"><span aria-hidden="true" /> INVESTOR CONNECTIONS</p>
            <h1>Investor <em>requests.</em></h1>
            <p className="iv-ir-subtitle">
              Discover what investors are looking for, respond with your pitch,
              or manage requests you've shared.
            </p>
          </div>

          {isInvestor && (
            <div className="iv-ir-header-actions">
              <Link to="/investor-request/my-closed-requests" className="iv-ir-outline-button">
                <FiFileText size={16} aria-hidden="true" /> Closed requests
              </Link>
              <Link to="/investor-request/create-new-request" className="iv-ir-primary-button">
                <FiPlus size={17} aria-hidden="true" /> Create request
              </Link>
            </div>
          )}
        </header>

        {!user?.id ? (
          <EmptyState
            title="Sign in to explore investor requests"
            description="Connect with investors and view opportunities after you sign in."
            action={<Link to="/login" className="iv-ir-primary-button">Sign in <FiArrowRight size={16} /></Link>}
          />
        ) : (
          <>
            <section className="iv-ir-toolbar" aria-label="Find investor requests">
              <div className="iv-ir-toolbar-heading">
                <div className="iv-ir-toolbar-title"><FiSliders size={17} aria-hidden="true" /> Explore requests</div>
                <span>{loading ? "Loading..." : `${myRequests.length + otherRequests.length} open requests`}</span>
              </div>

              <div className="iv-ir-tabs" aria-label="Choose which requests to see">
                {isInvestor && (
                  <button
                    type="button"
                    className={`iv-ir-tab ${activeTab === "mine" ? "is-active" : ""}`}
                    aria-pressed={activeTab === "mine"}
                    onClick={() => setActiveTab("mine")}
                  >
                    My requests <span>{myRequests.length}</span>
                  </button>
                )}
                <button
                  type="button"
                  className={`iv-ir-tab ${activeTab === "others" ? "is-active" : ""}`}
                  aria-pressed={activeTab === "others"}
                  onClick={() => setActiveTab("others")}
                >
                  Other investors <span>{otherRequests.length}</span>
                </button>
              </div>

              <div className="iv-ir-filters">
                <label className="iv-ir-search">
                  <FiSearch size={18} aria-hidden="true" />
                  <span className="iv-ir-visually-hidden">Search investor requests</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    type="search"
                    placeholder="Search requests..."
                  />
                </label>

                <label className="iv-ir-select-wrap">
                  <span className="iv-ir-visually-hidden">Filter by category</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option value="all">All categories</option>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <FiChevronDown size={16} aria-hidden="true" />
                </label>

                <label className="iv-ir-select-wrap">
                  <span className="iv-ir-visually-hidden">Sort investor requests</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="rangeAsc">Narrowest range</option>
                    <option value="rangeDesc">Widest range</option>
                  </select>
                  <FiChevronDown size={16} aria-hidden="true" />
                </label>
              </div>

              {hasFilters && (
                <div className="iv-ir-clear-row">
                  <button type="button" onClick={clearFilters}>
                    <FiX size={14} aria-hidden="true" /> Clear filters
                  </button>
                </div>
              )}
            </section>

            <div className="iv-ir-results-heading">
              <div>
                <h2>{activeTab === "mine" && isInvestor ? "Your open requests" : "Open opportunities"}</h2>
                <p aria-live="polite">
                  {loading ? "Loading requests..." : fetchError ? "Unable to load requests" : `${visibleRequests.length} ${visibleRequests.length === 1 ? "request" : "requests"} found`}
                </p>
              </div>
            </div>

            {loading ? (
              <LoadingCards />
            ) : fetchError ? (
              <div className="iv-ir-state" role="alert">
                <span className="iv-ir-state-icon"><FiRefreshCw size={23} aria-hidden="true" /></span>
                <h2>Requests aren't loading</h2>
                <p>{fetchError}</p>
                <button type="button" className="iv-ir-primary-button" onClick={() => setRetryKey((key) => key + 1)}>
                  <FiRefreshCw size={16} aria-hidden="true" /> Try again
                </button>
              </div>
            ) : visibleRequests.length ? (
              <div className="iv-ir-card-grid">
                {visibleRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    mine={activeTab === "mine" && isInvestor}
                    onClose={setSelectedRequest}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={hasFilters ? "No matching requests" : activeTab === "mine" && isInvestor ? "No open requests yet" : "No investor requests available"}
                description={hasFilters ? "Try another search or clear your filters." : activeTab === "mine" && isInvestor ? "When you publish an investment request, it will appear here." : "New investor requests will appear here when they're posted."}
                onClear={hasFilters ? clearFilters : undefined}
                action={activeTab === "mine" && isInvestor ? (
                  <Link to="/investor-request/create-new-request" className="iv-ir-primary-button">
                    <FiPlus size={16} aria-hidden="true" /> Create a request
                  </Link>
                ) : null}
              />
            )}
          </>
        )}
      </div>

      {selectedRequest && (
        <div
          className="iv-ir-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !closing) setSelectedRequest(null);
          }}
        >
          <div
            className="iv-ir-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="iv-ir-modal-title"
            aria-describedby="iv-ir-modal-description"
          >
            <span className="iv-ir-modal-icon"><FiLock size={22} aria-hidden="true" /></span>
            <h2 id="iv-ir-modal-title">Close this request?</h2>
            <p id="iv-ir-modal-description">
              <strong>{selectedRequest.title}</strong> will disappear from the open requests feed.
              You can reopen it later from Closed requests.
            </p>
            <div className="iv-ir-modal-actions">
              <button type="button" ref={cancelRef} onClick={() => setSelectedRequest(null)} disabled={closing} className="iv-ir-modal-cancel">
                Keep open
              </button>
              <button type="button" onClick={closeRequest} disabled={closing} className="iv-ir-modal-confirm">
                <FiCheckCircle size={16} aria-hidden="true" /> {closing ? "Closing..." : "Close request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}
