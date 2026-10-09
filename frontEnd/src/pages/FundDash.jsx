
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiArrowUpRight,
  FiBriefcase,
  FiDollarSign,
  FiEdit2,
  FiLayers,
  FiMapPin,
  FiPlus,
  FiPhone,
  FiRefreshCw,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import "../styles/fund-dash.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function numericAmount(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  const amount = Number(String(value).replace(/[$,\s]/g, ""));
  return Number.isFinite(amount) ? amount : null;
}

function formatAmount(value) {
  const amount = numericAmount(value);
  if (amount !== null) return `$${moneyFormatter.format(amount)}`;
  return value ? String(value) : "Not specified";
}

function PitchCard({ pitch, onDelete }) {
  const location = [pitch.company_location, pitch.country]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="iv-fd-pitch-card">
      <div className="iv-fd-card-top">
        <span className="iv-fd-industry">
          <FiBriefcase size={14} aria-hidden="true" />
          {pitch.industry || "Business pitch"}
        </span>

        {pitch.stage && (
          <span className="iv-fd-stage">{pitch.stage}</span>
        )}
      </div>

      <div className="iv-fd-card-content">
        <h3>{pitch.title || "Untitled pitch"}</h3>

        <p className="iv-fd-location">
          <FiMapPin size={14} aria-hidden="true" />
          {location || "Location not specified"}
        </p>

        {pitch.cell_number && (
          <p className="iv-fd-contact">
            <FiPhone size={14} aria-hidden="true" />
            <span>{pitch.cell_number}</span>
          </p>
        )}

        <div className="iv-fd-market">
          <span>THE MARKET</span>
          <p>
            {pitch.the_market ||
              "Market information hasn't been added yet."}
          </p>
        </div>

        <div className="iv-fd-funding">
          <div>
            <span>RAISING GOAL</span>
            <strong>{formatAmount(pitch.total_raising_amount)}</strong>
          </div>

          <div>
            <span>MIN. INVESTMENT</span>
            <strong>{formatAmount(pitch.minimum_investment)}</strong>
          </div>
        </div>

        <div className="iv-fd-card-actions">
          <Link className="iv-fd-view" to={`/pitches/${pitch.id}`}>
            View pitch
            <FiArrowUpRight size={16} aria-hidden="true" />
          </Link>

          <Link
            className="iv-fd-edit"
            to={`/fundraise-dashboard/edit-pitch/${pitch.id}`}
          >
            <FiEdit2 size={15} aria-hidden="true" />
            Edit
          </Link>

          <button
            type="button"
            className="iv-fd-delete"
            onClick={() => onDelete(pitch)}
            aria-label={`Delete ${pitch.title || "pitch"}`}
            title="Delete pitch"
          >
            <FiTrash2 size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div
      className="iv-fd-pitch-card iv-fd-skeleton"
      aria-hidden="true"
    >
      <div className="iv-fd-card-top">
        <span className="iv-fd-skeleton-line iv-fd-skeleton-short" />
      </div>

      <div className="iv-fd-card-content">
        <span className="iv-fd-skeleton-line iv-fd-skeleton-title" />
        <span className="iv-fd-skeleton-line iv-fd-skeleton-short" />
        <span className="iv-fd-skeleton-line iv-fd-skeleton-paragraph" />
        <span className="iv-fd-skeleton-line iv-fd-skeleton-paragraph" />
        <span className="iv-fd-skeleton-line iv-fd-skeleton-box" />
      </div>
    </div>
  );
}

export default function FundDash() {
  const { user } = useAuthContext();

  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const [pitchToDelete, setPitchToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const cancelButtonRef = useRef(null);

  // Fetch the signed-in entrepreneur's pitches
  useEffect(() => {
    if (!user?.id) {
      setPitches([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    async function loadPitches() {
      setLoading(true);
      setError("");

      try {
        if (!API_BASE) {
          throw new Error("VITE_API_URL is not configured");
        }

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token is missing");
        }

        const response = await fetch(
          `${API_BASE}/pitches/users/${user.id}/pitches`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load pitches (${response.status})`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response");
        }

        if (!controller.signal.aborted) {
          setPitches(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error loading user pitches:", err);

          setError(
            "We couldn't load your pitches right now. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPitches();

    return () => controller.abort();
  }, [user?.id, retryKey]);

  // Summary numbers calculated from actual pitch data
  const overview = useMemo(() => {
    const goals = pitches
      .map((pitch) =>
        numericAmount(pitch.total_raising_amount)
      )
      .filter((amount) => amount !== null);

    const industries = new Set(
      pitches.map((pitch) => pitch.industry).filter(Boolean)
    );

    return {
      count: pitches.length,
      totalGoal:
        pitches.length > 0 && goals.length === pitches.length
          ? formatAmount(goals.reduce((a, b) => a + b, 0))
          : "—",
      industryCount: industries.size,
    };
  }, [pitches]);

  // Close the confirmation dialog with Escape
  useEffect(() => {
    if (!pitchToDelete) return;

    cancelButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !deleting) {
        setPitchToDelete(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () =>
      document.removeEventListener("keydown", onKeyDown);
  }, [pitchToDelete, deleting]);

  // Preserve the existing authenticated DELETE API
  async function confirmDelete() {
    if (!pitchToDelete || deleting || !user?.id) return;

    const id = pitchToDelete.id;
    setDeleting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/pitches/users/${user.id}/pitches/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete pitch"
        );
      }

      setPitches((current) =>
        current.filter((pitch) => pitch.id !== id)
      );

      setPitchToDelete(null);
      toast.success("Pitch deleted successfully");
    } catch (err) {
      console.error("Error deleting pitch:", err);
      toast.error(err.message || "Couldn't delete the pitch");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="iv-fd-page">
      <div className="iv-fd-container">
        {/* DASHBOARD HEADER */}
        <header className="iv-fd-header">
          <div className="iv-fd-intro">
            <div className="iv-fd-eyebrow">
              <span aria-hidden="true" />
              ENTREPRENEUR WORKSPACE
            </div>

            <h1>
              Manage your <em>fundraising pitches.</em>
            </h1>

            <p>
              Keep your ideas organized, update your pitches,
              and connect with potential investors.
            </p>
          </div>

          {user?.id && (
            <div className="iv-fd-header-actions">
              <Link
                className="iv-fd-secondary-action"
                to="/investor-list"
              >
                <FiUsers size={17} aria-hidden="true" />
                Explore investors
              </Link>

              <Link
                className="iv-fd-primary-action"
                to="/fundraise-dashboard/create-pitch"
              >
                <FiPlus size={18} aria-hidden="true" />
                Create a pitch
              </Link>
            </div>
          )}
        </header>

        {!user?.id ? (
          /* NOT SIGNED IN */
          <section className="iv-fd-state">
            <div className="iv-fd-state-icon">
              <FiUsers size={25} aria-hidden="true" />
            </div>

            <h2>Sign in to manage your pitches</h2>

            <p>
              Your personal fundraising workspace is
              available after you sign in.
            </p>

            <Link
              className="iv-fd-primary-action"
              to="/login"
            >
              Sign in
              <FiArrowRight size={17} aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <>
            {/* OVERVIEW */}
            <div
              className="iv-fd-stats"
              aria-label="Fundraising overview"
            >
              <div className="iv-fd-stat">
                <span className="iv-fd-stat-icon">
                  <FiBriefcase size={18} aria-hidden="true" />
                </span>

                <div>
                  <span className="iv-fd-stat-label">
                    YOUR PITCHES
                  </span>

                  <strong>
                    {loading || error ? "—" : overview.count}
                  </strong>
                </div>
              </div>

              <div className="iv-fd-stat">
                <span className="iv-fd-stat-icon">
                  <FiDollarSign size={18} aria-hidden="true" />
                </span>

                <div>
                  <span className="iv-fd-stat-label">
                    COMBINED FUNDING GOALS
                  </span>

                  <strong>
                    {loading || error
                      ? "—"
                      : overview.totalGoal}
                  </strong>
                </div>
              </div>

              <div className="iv-fd-stat">
                <span className="iv-fd-stat-icon">
                  <FiLayers size={18} aria-hidden="true" />
                </span>

                <div>
                  <span className="iv-fd-stat-label">
                    INDUSTRIES REPRESENTED
                  </span>

                  <strong>
                    {loading || error
                      ? "—"
                      : overview.industryCount}
                  </strong>
                </div>
              </div>
            </div>

            {/* PITCH LIST HEADING */}
            <div className="iv-fd-section-heading">
              <div>
                <h2>Your pitches</h2>
                <p>
                  Review the opportunities you've shared
                  with investors.
                </p>
              </div>

              {!loading && !error && (
                <span className="iv-fd-count">
                  {pitches.length}{" "}
                  {pitches.length === 1
                    ? "pitch"
                    : "pitches"}
                </span>
              )}
            </div>

            {/* LOADING */}
            {loading ? (
              <div
                className="iv-fd-grid"
                role="status"
                aria-label="Loading your pitches"
              >
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : error ? (
              /* ERROR */
              <section className="iv-fd-state" role="alert">
                <div className="iv-fd-state-icon">
                  <FiRefreshCw size={25} aria-hidden="true" />
                </div>

                <h2>Couldn't load your pitches</h2>
                <p>{error}</p>

                <button
                  className="iv-fd-primary-action"
                  type="button"
                  onClick={() =>
                    setRetryKey((value) => value + 1)
                  }
                >
                  <FiRefreshCw size={16} aria-hidden="true" />
                  Try again
                </button>
              </section>
            ) : pitches.length === 0 ? (
              /* EMPTY STATE */
              <section className="iv-fd-state">
                <div className="iv-fd-state-icon">
                  <FiPlus size={25} aria-hidden="true" />
                </div>

                <h2>Your first pitch starts here.</h2>

                <p>
                  Share your business idea and make it
                  discoverable to investors on Innovest.
                </p>

                <Link
                  className="iv-fd-primary-action"
                  to="/fundraise-dashboard/create-pitch"
                >
                  <FiPlus size={17} aria-hidden="true" />
                  Create your first pitch
                </Link>
              </section>
            ) : (
              /* EXISTING PITCHES */
              <div className="iv-fd-grid">
                {pitches.map((pitch) => (
                  <PitchCard
                    key={pitch.id}
                    pitch={pitch}
                    onDelete={setPitchToDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      {pitchToDelete && (
        <div
          className="iv-fd-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleting
            ) {
              setPitchToDelete(null);
            }
          }}
        >
          <div
            className="iv-fd-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="iv-fd-modal-title"
            aria-describedby="iv-fd-modal-description"
          >
            <button
              type="button"
              className="iv-fd-modal-close"
              aria-label="Close dialog"
              onClick={() => setPitchToDelete(null)}
              disabled={deleting}
            >
              <FiX size={19} aria-hidden="true" />
            </button>

            <div className="iv-fd-warning-icon">
              <FiAlertTriangle size={23} aria-hidden="true" />
            </div>

            <h2 id="iv-fd-modal-title">
              Delete this pitch?
            </h2>

            <p id="iv-fd-modal-description">
              You're about to delete{" "}
              <strong>
                {pitchToDelete.title || "this pitch"}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="iv-fd-modal-actions">
              <button
                type="button"
                className="iv-fd-cancel"
                ref={cancelButtonRef}
                disabled={deleting}
                onClick={() => setPitchToDelete(null)}
              >
                Keep pitch
              </button>

              <button
                type="button"
                className="iv-fd-confirm-delete"
                disabled={deleting}
                onClick={confirmDelete}
              >
                <FiTrash2 size={15} aria-hidden="true" />
                {deleting
                  ? "Deleting..."
                  : "Delete pitch"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2300}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </main>
  );
}
