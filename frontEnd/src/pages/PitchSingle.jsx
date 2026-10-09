
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";

import "../styles/pitch-single.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

const amountFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatAmount(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not specified";
  }

  const text = String(value).trim();
  const numeric = Number(text.replace(/[$,]/g, ""));

  return Number.isFinite(numeric)
    ? `$${amountFormatter.format(numeric)}`
    : text;
}

function displayText(value, fallback = "Not provided yet.") {
  return value === null ||
    value === undefined ||
    String(value).trim() === ""
    ? fallback
    : String(value).trim();
}

/* =========================================
   REUSABLE CONTENT BLOCK
========================================= */

function DetailBlock({ title, children }) {
  return (
    <div className="ps-detail-block">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

/* =========================================
   REUSABLE SECTION CARD
========================================= */

function ContentCard({
  icon: Icon,
  title,
  subtitle,
  children,
}) {
  return (
    <section className="ps-content-card">
      <div className="ps-content-card-heading">
        <span className="ps-section-icon" aria-hidden="true">
          <Icon size={19} />
        </span>

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="ps-content-card-body">
        {children}
      </div>
    </section>
  );
}

/* =========================================
   ERROR / NOT FOUND
========================================= */

function MessageState({ type, onRetry }) {
  const notFound = type === "not-found";

  return (
    <div
      className="ps-feedback"
      role={notFound ? "status" : "alert"}
    >
      <span
        className="ps-feedback-icon"
        aria-hidden="true"
      >
        {notFound ? (
          <FiBriefcase size={24} />
        ) : (
          <FiRefreshCw size={24} />
        )}
      </span>

      <h1>
        {notFound
          ? "Pitch not found"
          : "Couldn't load this pitch"}
      </h1>

      <p>
        {notFound
          ? "This opportunity may have been removed or the link may be incorrect."
          : "Something went wrong while fetching the details. Please try again."}
      </p>

      <div className="ps-feedback-actions">
        <Link
          to="/pitches"
          className="ps-button ps-button-primary"
        >
          <FiArrowLeft size={16} aria-hidden="true" />
          Explore other pitches
        </Link>

        {!notFound && (
          <button
            type="button"
            className="ps-button ps-button-outline"
            onClick={onRetry}
          >
            <FiRefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================
   MAIN PITCH DETAILS PAGE
========================================= */

export default function PitchSingle() {
  const { id } = useParams();

  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  /* FETCH EXISTING PITCH API */
  useEffect(() => {
    const controller = new AbortController();

    async function loadPitch() {
      setLoading(true);
      setError(false);
      setNotFound(false);
      setPitch(null);

      try {
        if (!API_BASE) {
          throw new Error(
            "VITE_API_URL is not configured"
          );
        }

        const response = await fetch(
          `${API_BASE}/pitches/${encodeURIComponent(id)}`,
          {
            signal: controller.signal,
          }
        );

        if (response.status === 404) {
          if (!controller.signal.aborted) {
            setNotFound(true);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Failed to fetch pitch (${response.status})`
          );
        }

        const data = await response.json();

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data)
        ) {
          throw new Error("Unexpected pitch response");
        }

        if (!controller.signal.aborted) {
          setPitch(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(
            "Error fetching pitch:",
            err
          );
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPitch();

    return () => controller.abort();
  }, [id, retryKey]);

  const location = pitch
    ? [
        pitch.company_location,
        pitch.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const phone = pitch?.cell_number
    ? String(pitch.cell_number).trim()
    : "";

  const phoneLink = phone.replace(/[^\d+]/g, "");

  const founderName = displayText(
    pitch?.user_name,
    "Pitch creator"
  );

  return (
    <main className="innovest-pitch-single">
      <div className="ps-page-container">

        {/* BREADCRUMB */}
        <nav
          className="ps-breadcrumb"
          aria-label="Breadcrumb"
        >
          <Link to="/pitches">
            <FiArrowLeft
              size={16}
              aria-hidden="true"
            />
            All investment pitches
          </Link>

          <span
            className="ps-breadcrumb-divider"
            aria-hidden="true"
          >
            /
          </span>

          <span>Pitch details</span>
        </nav>

        {/* LOADING STATE */}
        {loading ? (
          <div
            className="ps-loading"
            role="status"
            aria-live="polite"
          >
            <span
              className="ps-loading-spinner"
              aria-hidden="true"
            />

            <span>Loading pitch details...</span>
          </div>
        ) : notFound || error ? (
          <MessageState
            type={notFound ? "not-found" : "error"}
            onRetry={() =>
              setRetryKey((value) => value + 1)
            }
          />
        ) : pitch ? (
          <>
            {/* ==================================
                PITCH HEADER
            ================================== */}

            <header className="ps-hero">
              <div className="ps-hero-copy">

                <div className="ps-eyebrow">
                  <span
                    className="ps-eyebrow-dot"
                    aria-hidden="true"
                  />
                  Investment opportunity
                </div>

                <h1>
                  {displayText(
                    pitch.title,
                    "Untitled opportunity"
                  )}
                </h1>

                <p className="ps-hero-intro">
                  Explore this business, its market,
                  progress, and investment needs.
                </p>

                {/* PITCH TAGS */}
                <div
                  className="ps-tags"
                  aria-label="Pitch information"
                >
                  {pitch.industry && (
                    <span className="ps-tag ps-tag-main">
                      <FiBriefcase
                        size={14}
                        aria-hidden="true"
                      />
                      {pitch.industry}
                    </span>
                  )}

                  {pitch.stage && (
                    <span className="ps-tag">
                      {pitch.stage}
                    </span>
                  )}

                  {location && (
                    <span className="ps-tag">
                      <FiMapPin
                        size={14}
                        aria-hidden="true"
                      />
                      {location}
                    </span>
                  )}
                </div>
              </div>

              {/* Decorative illustration */}
              <div
                className="ps-hero-symbol"
                aria-hidden="true"
              >
                <div className="ps-hero-symbol-inner">
                  <FiTrendingUp
                    size={42}
                    strokeWidth={1.3}
                  />
                </div>
              </div>
            </header>

            {/* ==================================
                MAIN TWO-COLUMN LAYOUT
            ================================== */}

            <div className="ps-layout">

              {/* LEFT: BUSINESS DETAILS */}
              <div className="ps-main-column">

                <ContentCard
                  icon={FiBriefcase}
                  title="About the business"
                  subtitle="The idea and the opportunity behind it"
                >
                  <DetailBlock title="Business overview">
                    {displayText(pitch.the_business)}
                  </DetailBlock>

                  <DetailBlock title="The market">
                    {displayText(pitch.the_market)}
                  </DetailBlock>
                </ContentCard>

                <ContentCard
                  icon={FiActivity}
                  title="Progress & direction"
                  subtitle="What has been achieved and what comes next"
                >
                  <DetailBlock title="Progress so far">
                    {displayText(pitch.progress)}
                  </DetailBlock>

                  <DetailBlock title="Business objective">
                    {displayText(pitch.objective)}
                  </DetailBlock>
                </ContentCard>

              </div>

              {/* RIGHT: INVESTMENT INFORMATION */}
              <aside
                className="ps-sidebar"
                aria-label="Investment and founder details"
              >
                <div className="ps-investment-card">

                  <div className="ps-investment-heading">
                    <span
                      className="ps-investment-icon"
                      aria-hidden="true"
                    >
                      <FiDollarSign size={19} />
                    </span>

                    <h2>Investment overview</h2>
                  </div>

                  {/* RAISING AMOUNT */}
                  <div className="ps-raising">
                    <span>Capital being raised</span>

                    <strong>
                      {formatAmount(
                        pitch.total_raising_amount
                      )}
                    </strong>
                  </div>

                  {/* MINIMUM INVESTMENT */}
                  <div className="ps-minimum">
                    <span>Minimum investment</span>

                    <strong>
                      {formatAmount(
                        pitch.minimum_investment
                      )}
                    </strong>
                  </div>

                  {/* INVESTOR DETAILS */}
                  <div className="ps-summary-details">

                    <div>
                      <span>Investment stage</span>

                      <strong>
                        {displayText(
                          pitch.stage,
                          "Not specified"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Ideal investor role</span>

                      <strong>
                        {displayText(
                          pitch.ideal_investor_role,
                          "Not specified"
                        )}
                      </strong>
                    </div>

                  </div>

                  {/* FOUNDER INFORMATION */}
                  <div className="ps-founder">
                    <span
                      className="ps-founder-avatar"
                      aria-hidden="true"
                    >
                      <FiUser size={22} />
                    </span>

                    <div className="ps-founder-info">
                      <span>Shared by</span>
                      <strong>{founderName}</strong>
                    </div>
                  </div>

                  {/* EXISTING PROFILE ACTION */}
                  {pitch.user_id !== null &&
                    pitch.user_id !== undefined && (
                      <Link
                        to={`/profile/${pitch.user_id}`}
                        className="ps-profile-link"
                      >
                        View founder profile

                        <FiArrowRight
                          size={17}
                          aria-hidden="true"
                        />
                      </Link>
                    )}

                  {/* CONTACT NUMBER */}
                  {phone && phoneLink && (
                    <a
                      href={`tel:${phoneLink}`}
                      className="ps-phone-link"
                    >
                      <FiPhone
                        size={16}
                        aria-hidden="true"
                      />
                      {phone}
                    </a>
                  )}

                  <p className="ps-disclaimer">
                    Pitch details are provided by
                    the entrepreneur.
                  </p>

                </div>
              </aside>

            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
