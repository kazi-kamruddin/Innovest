import React, { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/investor-request.css";

const InvestorRequests = () => {
  console.log("\n\n----------------- Investor Requests Page --------------------");

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const [isInvestor, setIsInvestor] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state (enhancements are additive; originals preserved)
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const checkInvestorStatus = async () => {
      if (!user) {
        console.log("No user logged in.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      console.log("Checking investor status for user:", user);

      try {
        const endpoint = `${API_BASE}/investor-info/${user.id}`;
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setIsInvestor(true);
            setActiveTab("my");
          } else {
            console.log("User is NOT an investor.");
            setActiveTab("all");
          }
        } else {
          console.error("Failed to fetch investor info. Status:", res.status);
        }
      } catch (error) {
        console.error("Error checking investor status:", error);
      }
    };

    const fetchRequests = async () => {
      console.log("Fetching all investor requests...");
      try {
        const endpoint = `${API_BASE}/investor-request`;
        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Fetched requests:", data);
          setRequests(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch investor requests. Status:", res.status);
          toast.error("Couldn't load investor requests.");
        }
      } catch (error) {
        console.error("Error fetching investor requests:", error);
        toast.error("Network error while loading requests.");
      } finally {
        setLoading(false);
      }
    };

    checkInvestorStatus();
    fetchRequests();
  }, [user]);

  // same semantics as your original lists
  const myRequests = useMemo(
    () => (user ? requests.filter((r) => r.investorId === user.id) : []),
    [requests, user]
  );
  const otherRequests = useMemo(
    () => (user ? requests.filter((r) => r.investorId !== user.id) : requests),
    [requests, user]
  );

  // Build category list for filter (non-breaking addition)
  const categories = useMemo(() => {
    const set = new Set(requests.map((r) => r.category).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [requests]);

  // helpers
  const fmtMoney = (v) =>
    typeof v === "number"
      ? v.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })
      : v;

  const applyFilters = (list) => {
    let out = [...list];

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
      if (sortBy === "newest")
        return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
      if (sortBy === "oldest")
        return new Date(a.createdAt || a.id) - new Date(b.createdAt || b.id);
      const aRange = (a.maxInvestment ?? 0) - (a.minInvestment ?? 0);
      const bRange = (b.maxInvestment ?? 0) - (b.minInvestment ?? 0);
      if (sortBy === "rangeAsc") return aRange - bRange;
      if (sortBy === "rangeDesc") return bRange - aRange;
      return 0;
    });

    return out;
  };

  const visibleMy = applyFilters(myRequests);
  const visibleOthers = applyFilters(otherRequests);

  const handleCloseRequest = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/investor-request/${selectedRequest.id}/close`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to close request");
      }

      toast.success("Request marked as closed!");
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
    } catch (error) {
      console.error("Error closing request:", error);
      toast.error("Failed to close request.");
    } finally {
      setShowModal(false);
      setSelectedRequest(null);
    }
  };

  // shared card renderer; actions remain identical to your original
  const renderCard = (r, isMine = false) => (
    <div key={r.id} className="ir-card">
      <div className="ir-card-top">
        <div className="ir-chip ir-chip--category" title="Category">
          {r.category || "Uncategorized"}
        </div>
        <div className="ir-chip ir-chip--status">Open</div>
      </div>

      <h4 className="ir-title" title={r.title}>
        {r.title}
      </h4>
      <p className="ir-desc">{r.description}</p>

      <div className="ir-meta">
        <div className="ir-meta-row">
          <span className="ir-label">Investment Range</span>
          <span className="ir-value">
            {fmtMoney(r.minInvestment)} – {fmtMoney(r.maxInvestment)}
          </span>
        </div>
        {r.createdAt && (
          <div className="ir-meta-row">
            <span className="ir-label">Posted</span>
            <span className="ir-value">
              {new Date(r.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="ir-actions">
        {isMine ? (
          <>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/investor-request/edit-request/${r.id}`)}
            >
              Edit Request
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                setSelectedRequest(r);
                setShowModal(true);
              }}
            >
              Mark as Closed
            </button>
            <button
              className="btn btn-ghost"
              onClick={() =>
                navigate(`/investor-request/${r.id}/response-pitches`)
              }
            >
              Response Pitches
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-primary"
              onClick={() =>
                navigate(`/investor-request/create-response-pitch/${r.id}`)
              }
            >
              Respond to Request
            </button>
            <button
              className="btn btn-ghost"
              onClick={() =>
                navigate(`/investor-request/${r.id}/response-pitches`)
              }
            >
              Response Pitches
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="ir">
      {/* Header (keeps your primary/secondary actions) */}
      <div className="ir-header">
        <div>
          <h2 className="ir-page-title">Investor Requests</h2>
          <p className="ir-page-sub">
            Discover opportunities, respond with pitches, or manage your own
            requests.
          </p>
        </div>

        {isInvestor && (
          <div className="ir-header-actions">
            <button
              onClick={() => navigate("/investor-request/create-new-request")}
              className="btn btn-primary"
            >
              Create New Request
            </button>

            <button
              onClick={() => navigate("/investor-request/my-closed-requests")}
              className="btn btn-secondary"
            >
              View Closed Requests
            </button>
          </div>
        )}
      </div>

      {/* Toolbar (tabs + non-invasive filters) */}
      <div className="ir-toolbar">
        <div className="ir-tabs" role="tablist" aria-label="Request owner tabs">
          {isInvestor && (
            <button
              role="tab"
              aria-selected={activeTab === "my"}
              className={`ir-tab ${activeTab === "my" ? "is-active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Requests ({myRequests.length})
            </button>
          )}
          <button
            role="tab"
            aria-selected={activeTab === "all"}
            className={`ir-tab ${activeTab === "all" ? "is-active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Other Investors ({otherRequests.length})
          </button>
        </div>

        <div className="ir-filters">
          <div className="ir-search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, description, or category..."
              aria-label="Search requests"
            />
            <span className="ir-search-icon" aria-hidden>
              🔎
            </span>
          </div>

          <select
            className="ir-select"
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
            className="ir-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rangeAsc">Investment Range ↑</option>
            <option value="rangeDesc">Investment Range ↓</option>
          </select>
        </div>
      </div>

      {/* Content: retains your original loading + sections + actions */}
      {loading ? (
        <div className="ir-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ir-card ir-skeleton">
              <div className="ir-skel-line w-2/3" />
              <div className="ir-skel-line" />
              <div className="ir-skel-line w-1/2" />
              <div className="ir-skel-line w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {activeTab === "my" && isInvestor && (
            <>
              {myRequests.length > 0 ? (
                <div className="ir-grid">
                  {applyFilters(myRequests).map((r) => renderCard(r, true))}
                </div>
              ) : (
                <div className="ir-empty">
                  <div className="ir-empty-emoji" aria-hidden>
                    🗂️
                  </div>
                  <h4>No matching requests</h4>
                  <p>Try adjusting your filters or create a new request.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate("/investor-request/create-new-request")
                    }
                  >
                    Create New Request
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === "all" && (
            <>
              {otherRequests.length > 0 ? (
                <div className="ir-grid">
                  {applyFilters(otherRequests).map((r) =>
                    renderCard(r, false)
                  )}
                </div>
              ) : (
                <div className="ir-empty">
                  <div className="ir-empty-emoji" aria-hidden>
                    🔍
                  </div>
                  <h4>No investor requests available.</h4>
                  <p>Try a different search or clear the category filter.</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Fallback message if both lists are empty (preserved) */}
      {!loading && myRequests.length === 0 && otherRequests.length === 0 && (
        <p className="ir-fallback">No investor requests available.</p>
      )}

      {/* Confirmation Modal (preserved behavior) */}
      {showModal && selectedRequest && (
        <div
          className="ir-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ir-modal-title"
        >
          <div
            className="ir-modal__backdrop"
            onClick={() => setShowModal(false)}
          />
          <div className="ir-modal__content">
            <h5 id="ir-modal-title" className="ir-modal__title">
              Mark request as closed?
            </h5>
            <p className="ir-modal__body">
              Are you sure you want to mark{" "}
              <strong>"{selectedRequest.title}"</strong> as closed? This will
              hide it from the main feed.
            </p>
            <div className="ir-modal__actions">
              <button className="btn btn-danger" onClick={handleCloseRequest}>
                Yes, Close
              </button>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
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

export default InvestorRequests;
