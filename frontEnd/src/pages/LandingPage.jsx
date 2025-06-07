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
  const { ref: statsRef, inView: statsInView } = useInView({
  triggerOnce: false, 
  threshold: 0.3,
  });
  const { ref: bannerHeaderRef, inView: bannerHeaderInView } = useInView({
  threshold: 0.3,
  });
  const orangeStats = [
  { number: '2k+', label: 'Trusted Users' },
  { number: '1k+', label: 'Entrepreneurs Joined' },
  { number: '500+', label: 'Community Connections' },
  ];
  const purpleStats = [
  { number: '70%', label: 'Investor Retention Rate' },
  { number: '78%', label: 'Repeat Investment' },
  { number: '82%', label: 'Funding Success' },
  ];
  function AnimatedStatCard({ stats, className }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const current = stats[index];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % stats.length);
        setFade(true);
      }, 500);
    }, 2500); 

    return () => clearInterval(interval);
  }, [stats]);
  return (
    <div className={`stat-card ${className}`}>
      <h2>
        <span className={`animated-stat-cycle ${fade ? 'fade-in' : 'fade-out'}`}>
          {current.number}
        </span>
      </h2>
      <p className={`animated-stat-cycle ${fade ? 'fade-in' : 'fade-out'}`}>
        {current.label}
      </p>
    </div>
  );
}
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
  <div className="hero-main-content">
    <div className="hero-left">
    <h1 className="hero-heading" ref={bannerHeaderRef}>
  Connecting Investors and Innovation together here in{' '}
  <span className="highlight-word typewriter-inline">
    {bannerHeaderInView && (
      <Typewriter
        key={typewriterKey}
        onInit={(typewriter) => {
          typewriter.typeString('Innovest').pauseFor(2000).start();
        }}
        options={{
          autoStart: false,
          loop: true,
          delay: 250,
          cursor: '',
        }}
      />
    )}
  </span>
</h1>
      <p className="hero-subtext">
        Where great businesses and great people meet. We bring together businesses
        looking for investment and investors with capital, contacts and knowledge
        to help them succeed.
      </p>
      <div className="hero-buttons">
        <Link to="/fundraise-dashboard">
          <button className="btn modern">GET STARTED NOW</button>
        </Link>
      </div>
     <div className="hero-stats-section">
  <div className="hero-stats-left">
    <img src="/src/images/avatar.jpeg" alt="Business" className="main-woman-img" />
    <div className="text-overlay">
      <h3>What We Do</h3>
      <p>Link investors<br />with visionary entrepreneurs</p>
    </div>
  </div>
  <div className="hero-stats-right" ref={statsRef}>
  <AnimatedStatCard stats={orangeStats} className="orange" />
  <AnimatedStatCard stats={purpleStats} className="purple" />
</div>
</div>
    </div>
    <div className="hero-right">
  <div className="circle-wrapper">
    <img src="src/images/first.png" alt="Business" className="circle-photo" />
      <img src="src/images/financial7.jpg" alt="Square 3" className="square-photo3 top" />
    <img src="src/images/financial6.jpg" alt="Square 1" className="square-photo top-left" />
    <img src="src/images/financial8.gif" alt="Square 2" className="square-photo2 bottom-right" />
  </div>
</div>
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
