
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiClock,
  FiTarget,
  FiUsers,
} from "react-icons/fi";

import "../styles/about-us.css";

import sakib from "../assets/sakib.jpg";
import sumit from "../assets/sumit.jpg";
import sadik from "../assets/sadik.jpg";
import kazi from "../assets/kazi.jpg";

const teamMembers = [
  {
    name: "Kazi Kamruddin Ahmed",
    shortName: "Kazi",
    position: "Project Leader",
    image: kazi,
  },
  {
    name: "Sadik Rahman",
    shortName: "Sadik",
    position: "FrontEnd + BackEnd",
    image: sadik,
  },
  {
    name: "Sumit Majumder",
    shortName: "Sumit",
    position: "FrontEnd + BackEnd",
    image: sumit,
  },
  {
    name: "Abdullah Ishtiaq",
    shortName: "Abdullah",
    position: "FrontEnd",
    image: sakib,
  },
];

export default function AboutUs() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <main className="about-us-page">
      <div className="about-us-container">

        {/* ==================================
            INTRODUCTION
        ================================== */}
        <header className="about-us-hero">
          <div className="about-us-hero-content">
            <div className="about-us-eyebrow">
              <span className="about-us-eyebrow-dot" />
              THE STORY BEHIND INNOVEST
            </div>

            <h1>
              Good ideas deserve
              <span> the right connections.</span>
            </h1>

            <p className="about-us-hero-description">
              Innovest brings entrepreneurs and investors
              closer together, creating space for innovative
              ideas, meaningful partnerships, and opportunities
              to grow.
            </p>

            <div className="about-us-hero-tags">
              <span>
                <FiUsers size={15} />
                Entrepreneurs
              </span>

              <span className="about-us-tag-divider">
                &
              </span>

              <span>
                <FiArrowUpRight size={15} />
                Investors
              </span>
            </div>
          </div>

          <div
            className="about-us-hero-art"
            aria-hidden="true"
          >
            <div className="about-us-hero-orbit about-us-orbit-one" />
            <div className="about-us-hero-orbit about-us-orbit-two" />

            <div className="about-us-hero-art-content">
              <span>WHAT CONNECTS US</span>

              <strong>
                Ideas.
                <br />
                People.
                <br />
                <em>Possibility.</em>
              </strong>

              <div className="about-us-hero-art-line">
                <span />
                <FiArrowUpRight size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* ==================================
            THE DEVELOPMENT TEAM
        ================================== */}
        <section
          className="about-us-team-section"
          aria-labelledby="about-us-team-heading"
        >
          <div className="about-us-section-heading">
            <div className="about-us-heading-main">
              <div className="about-us-section-eyebrow">
                <span className="about-us-section-number">
                  01
                </span>
                THE PEOPLE
              </div>

              <h2 id="about-us-team-heading">
                Meet the minds
                <span> behind Innovest.</span>
              </h2>
            </div>

            <div className="about-us-heading-aside">
              <span className="about-us-team-count">
                04 / TEAM MEMBERS
              </span>

              <p>
                A small team, one shared vision,
                and a passion for building something
                meaningful.
              </p>
            </div>
          </div>

          {/* THE ORIGINAL EXPANDING IMAGE EFFECT */}
          <div
            className="about-us-gallery"
            role="group"
            aria-label="Meet the Innovest development team"
          >
            {teamMembers.map((member, index) => (
              <button
                key={member.name}
                type="button"
                className={`about-us-card ${
                  activeIndex === index
                    ? "is-active"
                    : ""
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                aria-pressed={activeIndex === index}
                aria-label={`View ${member.name}, ${member.position}`}
              >
                <img
                  src={member.image}
                  alt=""
                  className="about-us-card-image"
                  draggable={false}
                />

                <span
                  className="about-us-card-index"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className="about-us-card-arrow"
                  aria-hidden="true"
                >
                  <FiArrowUpRight size={20} />
                </span>

                <span
                  className="about-us-overlay-text"
                  aria-hidden="true"
                >
                  <span className="about-us-team-role">
                    {member.position}
                  </span>

                  <span className="about-us-team-name">
                    {member.name}
                  </span>

                  <span className="about-us-card-bottom-line" />
                </span>
              </button>
            ))}
          </div>

          {/* MOBILE TEAM SELECTOR */}
          <div
            className="about-us-mobile-selector"
            role="group"
            aria-label="Select a team member"
          >
            {teamMembers.map((member, index) => (
              <button
                key={member.name}
                type="button"
                className={`about-us-member-choice ${
                  activeIndex === index
                    ? "is-selected"
                    : ""
                }`}
                onClick={() => setActiveIndex(index)}
                aria-pressed={activeIndex === index}
              >
                {member.shortName}
              </button>
            ))}
          </div>

          {/* GALLERY CAPTION */}
          <div className="about-us-gallery-footer">
            <p>
              <span className="about-us-hint-icon">
                ✦
              </span>

              <span className="about-us-desktop-hint">
                Hover over a portrait to meet the team.
              </span>

              <span className="about-us-mobile-hint">
                Tap a portrait to explore the team.
              </span>
            </p>

            <span className="about-us-image-counter">
              {String(activeIndex + 1).padStart(2, "0")}
              <span> / 04</span>
            </span>
          </div>
        </section>

        {/* ==================================
            OUR MISSION & HISTORY
        ================================== */}
        <section
          className="about-us-story-section"
          aria-labelledby="about-us-story-heading"
        >
          <div className="about-us-story-heading">
            <div className="about-us-section-eyebrow">
              <span className="about-us-section-number">
                02
              </span>
              OUR FOUNDATION
            </div>

            <h2 id="about-us-story-heading">
              What drives us
              <span> forward.</span>
            </h2>

            <p>
              The purpose and thinking behind
              everything we&apos;re building.
            </p>
          </div>

          <div className="about-us-story-grid">

            {/* MISSION */}
            <article className="about-us-story-card about-us-mission-card">
              <div className="about-us-story-card-top">
                <span className="about-us-story-icon">
                  <FiTarget size={22} />
                </span>

                <span className="about-us-story-label">
                  01 / OUR PURPOSE
                </span>
              </div>

              <h3 className="about-us-section-title">
                Our Mission
              </h3>

              <p className="about-us-section-text">
                At Innovest, our mission is to bridge
                the gap between visionary entrepreneurs
                and forward-thinking investors. We strive
                to empower startups and businesses by
                providing a seamless platform where
                innovative ideas meet the right funding
                opportunities. Through collaboration,
                insights, and data-driven decision-making,
                we aim to foster an ecosystem of growth,
                success, and strategic partnerships.
              </p>

              <div
                className="about-us-story-decoration"
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
              </div>
            </article>

            {/* HISTORY */}
            <article className="about-us-story-card about-us-history-card">
              <div className="about-us-story-card-top">
                <span className="about-us-story-icon">
                  <FiClock size={22} />
                </span>

                <span className="about-us-story-label">
                  02 / OUR JOURNEY
                </span>
              </div>

              <h3 className="about-us-section-title">
                Our History
              </h3>

              <p className="about-us-section-text">
                Innovest was founded with the goal of
                revolutionizing the way entrepreneurs
                connect with investors. Recognizing the
                challenges startups face in securing
                funding, we built a platform that
                simplifies and enhances the investment
                process. Over time, we have grown into
                a trusted space for entrepreneurs,
                angel investors, venture capitalists,
                and business consultants. With continuous
                innovation and a commitment to
                transparency, Innovest has become a
                hub for fostering groundbreaking ideas
                and meaningful financial partnerships.
              </p>

              <div
                className="about-us-story-decoration"
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
              </div>
            </article>

          </div>
        </section>

        {/* ==================================
            FINAL CALL TO ACTION
        ================================== */}
        <section className="about-us-cta">
          <div className="about-us-cta-copy">
            <span>THE NEXT STEP STARTS HERE</span>

            <h2>
              Let&apos;s turn great ideas
              <br />
              into meaningful connections.
            </h2>

            <p>
              Discover businesses, explore opportunities,
              and be part of what comes next.
            </p>
          </div>

          <Link
            to="/pitches"
            className="about-us-cta-button"
          >
            Explore opportunities
            <FiArrowRight size={18} />
          </Link>
        </section>

      </div>
    </main>
  );
}
