import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from "react-router-dom";
import Typewriter from 'typewriter-effect';
import '../styles/landing-page.css';

function LandingPage() {
  const cardRefs = useRef([]);
  const powerImgRefs = useRef([]);
  const [typewriterKey, setTypewriterKey] = useState(0);
  const { ref: powerHeaderRef, inView: powerHeaderInView } = useInView({
    threshold: 0.3,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const index = cardRefs.current.indexOf(entry.target);
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, index * 600);
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.3 }
    );

    cardRefs.current.forEach(card => {
      if (card) observer.observe(card);
    });

    return () => {
      cardRefs.current.forEach(card => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  useEffect(() => {
    const imgObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const index = powerImgRefs.current.indexOf(entry.target);
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, index * 600);
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.3 }
    );

    powerImgRefs.current.forEach(img => {
      if (img) imgObserver.observe(img);
    });

    return () => {
      powerImgRefs.current.forEach(img => {
        if (img) imgObserver.unobserve(img);
      });
    };
  }, []);

  useEffect(() => {
    if (powerHeaderInView) {
      setTypewriterKey(prev => prev + 1);
    }
  }, [powerHeaderInView]);

  return (
    <>
      {/* Banner */}
      <div className="hero">
        <div className="hero-content">
          <h1>
            Connecting Investors and Innovation together here in{" "}
            <span className="animated-innovest">Innovest</span>
          </h1>
          <p>
            Where great businesses and great people meet. We bring together businesses
            looking for investment and investors with capital, contacts and knowledge
            to help them succeed.
          </p>
          <div className="hero-buttons">
            <Link to="/fundraise-dashboard">
              <button className="btn secondary">Get Started →</button>
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="src/images/first.png" alt="Hero Section Image" />
        </div>
      </div>

      {/* Investment Future */}
      <div className="future">
        <section className="blockchain-section">
          <h1>Innovest: The Foundation of the Future</h1>
          <p>
            Innovest is more than just a platform—it's the foundation where groundbreaking ideas
            transform into successful ventures.<br />
            By bridging the gap between ambitious entrepreneurs and visionary investors, we create
            an ecosystem where innovation thrives and opportunities flourish.
          </p>

          <div className="future-container">
            {["future1.jpeg", "future2.jpeg", "future3.jpeg"].map((img, index) => (
              <div
                className="fade-in-card"
                key={index}
                ref={el => cardRefs.current[index] = el}
                style={{ animationDelay: `${index * 0.4}s` }}
              >
                <div className="future-card">
                  <div className="image-container">
                    <img
                      src={`src/images/${img}`}
                      alt={`Image ${index + 1}`}
                      className="image-placeholder"
                    />
                  </div>
                  <div className="description-container">
                    <p className="description">
                      {[
                        "Empowering businesses to grow, expand, and thrive globally.",
                        "A thriving network of entrepreneurs, investors, and industry leaders.",
                        "Connecting startups with capital, mentorship, and opportunities."
                      ][index]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Our Clients */}
      <div className="client">
        <div className="client-content">
          <h2>Our Clients</h2>
          <p>We have been working with some Fortune 300+ clients</p>
        </div>
        <div className="client-logos">
          <img src="src/images/logo1.jpg" alt="Client Logo 1" />
          <img src="src/images/logo2.jpeg" alt="Client Logo 2" />
          <img src="src/images/logo3.jpg" alt="Client Logo 3" />
          <img src="src/images/logo4.jpeg" alt="Client Logo 4" />
          <img src="src/images/logo5.jpeg" alt="Client Logo 5" />
        </div>
      </div>

      {/* Power of Investment */}
      <div className="power">
        <div className="power-content">
          <div className="header" ref={powerHeaderRef}>
            {powerHeaderInView && (
              <Typewriter
                key={typewriterKey}
                onInit={(typewriter) => {
                  typewriter
                    .typeString('Explore the Power of Investment')
                    .callFunction(() => {})
                    .start();
                }}
                options={{
                  autoStart: false,
                  loop: false,
                  delay: 50,
                  cursor: '',
                }}
              />
            )}
          </div>
          <div className="sub-header">Who can benefit from investment?</div>
          <div className="cards">
            {[
              {
                src: "src/images/power1.jpg",
                alt: "power logo 1",
                title: "Creator Communities",
                bubbles: [
                  "Support creators with multiple marketplaces and direct engagement with their audience.",
                  "Build brand identity with authentic interactions.",
                  "Drive monetization through loyal audiences.",
                ]
              },
              {
                src: "src/images/power2.jpeg",
                alt: "power logo 2",
                title: "Financial Institutions",
                bubbles: [
                  "Technology enables secure, fast and advanced financial transactions.",
                  "AI-driven insights for risk management.",
                  "Revolutionize finance through automation.",
                ]
              },
              {
                src: "src/images/power3.jpg",
                alt: "power logo 3",
                title: "Supply Chain Management",
                bubbles: [
                  "Enhance traceability, transparency, and operational efficiency across global supply chains.",
                  "Track products in real-time from source to shelf.",
                  "Optimize logistics with smart tech.",
                ]
              }
            ].map(({ src, alt, title, bubbles }, i) => (
              <div className="card" key={i}>
                <img
                  src={src}
                  alt={alt}
                  ref={el => powerImgRefs.current[i] = el}
                  className="power-card-img"
                />
                <div className="card-title">{title}</div>
                <div className="card-text">
                  <div className="bubble-sliderr">
                    {bubbles.map((text, idx) => (
                      <div className="bubble-slidee" key={idx}>{text}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </>
  );
}

export default LandingPage;
