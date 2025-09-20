import React, { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/investor-request-closed.css";

const MyClosedRequests = () => {
  const { user } = useAuthContext();
  const API_BASE = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI enhancements (non-breaking)
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // recent | oldest | rangeAsc | rangeDesc

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchClosedRequests = async () => {
      try {
        const res = await fetch(`${API_BASE}/investor-request/my-closed`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setRequests(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch closed requests. Status:", res.status);
          toast.error("Couldn't load your closed requests.");
        }
      } catch (error) {
        console.error("Error fetching closed requests:", error);
        toast.error("Network error while loading closed requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchClosedRequests();
  }, [user, API_BASE]);

  const handleReopen = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/investor-request/${selectedRequest.id}/reopen`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to reopen");

      toast.success("Request reopened!");
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
    } catch (error) {
      console.error("Error reopening request:", error);
      toast.error("Could not reopen request");
    } finally {
      setShowModal(false);
      setSelectedRequest(null);
    }
  };

  // Helpers
  const fmtMoney = (v) =>
    typeof v === "number"
      ? v.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })
      : v;

  const categories = useMemo(() => {
    const set = new Set(requests.map((r) => r.category).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [requests]);

  const visible = useMemo(() => {
    let out = [...requests];

    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q)
      );
    }

    if (category !== "all") {
      out = out.filter((r) => r.category === category);
    }

    out.sort((a, b) => {
      // Prefer closedAt for sorting if your API returns it; fallback to createdAt or id.
      const aTime = new Date(a.closedAt || a.updatedAt || a.createdAt || a.id);
      const bTime = new Date(b.closedAt || b.updatedAt || b.createdAt || b.id);

      if (sortBy === "recent") return bTime - aTime;
      if (sortBy === "oldest") return aTime - bTime;

      const aRange = (a.maxInvestment ?? 0) - (a.minInvestment ?? 0);
      const bRange = (b.maxInvestment ?? 0) - (b.minInvestment ?? 0);
      if (sortBy === "rangeAsc") return aRange - bRange;
      if (sortBy === "rangeDesc") return bRange - aRange;

      return 0;
    });

    return out;
  }, [requests, query, category, sortBy]);

  return (
    <div className="my-closed-requests irc">
      <div className="irc-header">
        <div>
          <h2 className="irc-title">My Closed Requests</h2>
          <p className="irc-sub">Review your closed investment requests and reopen if needed.</p>
        </div>

        <div className="irc-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/investor-request")}
          >
            Back to All Requests
          </button>
        </div>
      </div>

      {/* Toolbar: search / category / sort */}
      <div className="irc-toolbar">
        <div className="irc-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, or category…"
            aria-label="Search closed requests"
          />
          <span className="irc-search-icon" aria-hidden>🔎</span>
        </div>

        <div className="irc-filter-row">
          <select
            className="irc-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>

          <select
            className="irc-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort"
          >
            <option value="recent">Recently Closed</option>
            <option value="oldest">Oldest</option>
            <option value="rangeAsc">Investment Range ↑</option>
            <option value="rangeDesc">Investment Range ↓</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="irc-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="irc-card irc-skeleton">
              <div className="irc-skel-line w-2/3" />
              <div className="irc-skel-line" />
              <div className="irc-skel-line w-1/2" />
              <div className="irc-skel-line w-1/3" />
            </div>
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="irc-grid">
          {visible.map((r) => (
            <div key={r.id} className="irc-card">
              <div className="irc-card-top">
                <div className="irc-chip irc-chip--category" title="Category">
                  {r.category || "Uncategorized"}
                </div>
                <div className="irc-chip irc-chip--closed">Closed</div>
              </div>

              <h4 className="irc-card-title" title={r.title}>{r.title}</h4>
              <p className="irc-card-desc">{r.description}</p>

              <div className="irc-meta">
                <div className="irc-meta-row">
                  <span className="irc-label">Investment Range</span>
                  <span className="irc-value">
                    {fmtMoney(r.minInvestment)} – {fmtMoney(r.maxInvestment)}
                  </span>
                </div>
                <div className="irc-meta-row">
                  <span className="irc-label">Status</span>
                  <span className="irc-value">{r.status || "Closed"}</span>
                </div>
                {(r.closedAt || r.updatedAt || r.createdAt) && (
                  <div className="irc-meta-row">
                    <span className="irc-label">Closed</span>
                    <span className="irc-value">
                      {new Date(r.closedAt || r.updatedAt || r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="irc-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedRequest(r);
                    setShowModal(true);
                  }}
                >
                  Reopen
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="irc-empty">
          <div className="irc-empty-emoji" aria-hidden>🗂️</div>
          <h4>You have no closed requests.</h4>
          <p>Once you close a request, it will show up here.</p>
          <button className="btn btn-secondary" onClick={() => navigate("/investor-request")}>
            Back to All Requests
          </button>
        </div>
      )}

      {/* Confirmation Modal (same behavior, styled) */}
      {showModal && selectedRequest && (
        <div
          className="irc-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="irc-modal-title"
        >
          <div
            className="irc-modal__backdrop"
            onClick={() => setShowModal(false)}
          />
          <div className="irc-modal__content">
            <h5 id="irc-modal-title" className="irc-modal__title">
              Reopen this request?
            </h5>
            <p className="irc-modal__body">
              Are you sure you want to reopen <strong>"{selectedRequest.title}"</strong>?
            </p>
            <div className="irc-modal__actions">
              <button className="btn btn-primary" onClick={handleReopen}>
                Yes, Reopen
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default MyClosedRequests;
