
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import Typewriter from "typewriter-effect";

import "../styles/landing-page.css";

import LandingHero from "../components/LandingHero";
import InvestorShowcase from "../components/InvestorShowcase";
import HowInnovestWorks from "../components/HowInnovestWorks";
import SectionDivider from "../components/SectionDivider";

// Existing project images
const images = import.meta.glob("../images/*", {
  eager: true,
  query: "?url",
  import: "default",
});

const image = (name) => images[`../images/${name}`];

// Power of Investment cards
const powerCards = [
  {
    src: image("power1.jpg"),
    alt: "Creator Communities",
    title: "Creator Communities",
    bubbles: [
      "Support creators with multiple marketplaces and direct engagement with their audience.",
      "Build brand identity with authentic interactions.",
      "Drive monetization through loyal audiences.",
    ],
  },
  {
    src: image("power2.jpeg"),
    alt: "Financial Institutions",
    title: "Financial Institutions",
    bubbles: [
      "Technology enables secure, fast and advanced financial transactions.",
      "AI-driven insights for risk management.",
      "Revolutionize finance through automation.",
    ],
  },
  {
    src: image("power3.jpg"),
    alt: "Supply Chain Management",
    title: "Supply Chain Management",
    bubbles: [
      "Enhance traceability, transparency, and operational efficiency across global supply chains.",
      "Track products in real-time from source to shelf.",
      "Optimize logistics with smart tech.",
    ],
  },
];

function LandingPage() {
  const powerImgRefs = useRef([]);
  const [typewriterKey, setTypewriterKey] = useState(0);

  // Detect when the Power of Investment heading is visible
  const {
    ref: powerHeaderRef,
    inView: powerHeaderInView,
  } = useInView({
    threshold: 0.3,
  });

  // Preserve scroll-triggered image animations
  useEffect(() => {
    const imageElements = powerImgRefs.current.filter(Boolean);
    const timeouts = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = powerImgRefs.current.indexOf(entry.target);

          if (entry.isIntersecting) {
            const timeout = setTimeout(() => {
              entry.target.classList.add("visible");
            }, index * 600);

            timeouts.push(timeout);
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    imageElements.forEach((img) => observer.observe(img));

    return () => {
      observer.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // Preserve heading typewriter animation
  useEffect(() => {
    if (powerHeaderInView) {
      setTypewriterKey((prev) => prev + 1);
    }
  }, [powerHeaderInView]);

  return (
    <>
      {/* ==========================================
          01. HERO SECTION
      ========================================== */}

      <LandingHero />

      <SectionDivider number="01" label="Explore" />

      {/* ==========================================
          02. INVESTOR & ENTREPRENEUR SHOWCASE
      ========================================== */}

      <InvestorShowcase />

      <SectionDivider number="02" label="Connect" />

      {/* ==========================================
          03. HOW INNOVEST WORKS
      ========================================== */}

      <HowInnovestWorks />

      <SectionDivider number="03" label="Grow" />

      {/* ==========================================
          04. POWER OF INVESTMENT
      ========================================== */}

      <section className="power">
        <div className="power-content">

          {/* Animated section heading */}
          <div className="header" ref={powerHeaderRef}>
            {powerHeaderInView && (
              <Typewriter
                key={typewriterKey}
                onInit={(typewriter) => {
                  typewriter
                    .typeString("Explore the Power of Investment")
                    .start();
                }}
                options={{
                  autoStart: false,
                  loop: false,
                  delay: 50,
                  cursor: "",
                }}
              />
            )}
          </div>

          {/* Section subtitle */}
          <div className="sub-header">
            Who can benefit from investment?
          </div>

          {/* Investment cards */}
          <div className="cards">
            {powerCards.map(
              ({ src, alt, title, bubbles }, index) => (
                <div className="card" key={title}>

                  {/* Scroll-triggered animated image */}
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    ref={(el) => {
                      powerImgRefs.current[index] = el;
                    }}
                    className="power-card-img"
                  />

                  {/* Card title */}
                  <div className="card-title">
                    {title}
                  </div>

                  {/* Animated card descriptions */}
                  <div className="card-text">
                    <div className="bubble-sliderr">
                      {bubbles.map((text, bubbleIndex) => (
                        <div
                          className="bubble-slidee"
                          key={bubbleIndex}
                        >
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )
            )}
          </div>

        </div>
      </section>
    </>
  );
}

export default LandingPage;
