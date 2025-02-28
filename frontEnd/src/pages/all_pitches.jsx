import React from "react";
import "../styles/all_pitches.css";

const InvestmentPitches = () => {
  return (
    <div className="investment-pitches">
      <div className="search-bar">
        <input type="text" placeholder="Search..." />
        <button>🔍</button>
      </div>
      <div className="navigation-links">
        <a href="#">My Portfolio</a>
        <a href="#">News Feed</a>
        <a href="#">Explore</a>
        <a href="#">My Matches</a>
      </div>
      <div className="pitch-cards">
        {[1, 2, 3].map((item) => (
          <div className="pitch-card" key={item}>
            <div className="card-header"></div>
            <div className="card-body">
              <h3>GEN AI DUBBING</h3>
              <p className="location">📍 North East, United States</p>
              <p className="description">
                Audiences want highly tailored video experiences in their native language,
                but video dubbing is incredibly time-consuming and costly.
              </p>
              <ul>
                <li>Enterprise integrations with Articulate, TechSmith, and InVideo</li>
                <li>358.9% growth in MRR ($60k total current MRR)</li>
                <li>Awarded AppSumo’s #1 performing campaign of 2023</li>
              </ul>
              <div className="funding-info">
                <span>$2,000,000 Required</span>
                <span>$15,000 Per Investor</span>
              </div>
              <button className="find-out-more">Find Out More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentPitches;
