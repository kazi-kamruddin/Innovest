import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import "../styles/all_pitches.css";

const InvestmentPitches = () => {
  const [pitches, setPitches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/pitches")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Data:", data); // Debugging API response
        // Ensure data is an array
        setPitches(Array.isArray(data) ? data : data.pitches || []);
      })
      .catch((error) => {
        console.error("Error fetching pitches:", error);
        setPitches([]); // Ensure pitches is always an array
      });
  }, []);

  const filteredPitches = Array.isArray(pitches)
    ? pitches.filter((pitch) =>
        pitch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pitch.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="investment-pitches">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button>🔍</button>
      </div>

      <div className="navigation-links">
        <a href="#">My Portfolio</a>
        <a href="#">News Feed</a>
        <a href="#">Explore</a>
        <a href="#">My Matches</a>
      </div>

      <div className="pitch-cards">
        {filteredPitches.length > 0 ? (
          filteredPitches.map((pitch) => (
            <div className="pitch-card" key={pitch.id}>
              <div className="card-header"></div>
              <div className="card-body">
                <h3>{pitch.title}</h3>
                <p className="location">📍 {pitch.company_location}, {pitch.country}</p>
                <p><strong>Market:</strong> {pitch.the_market}</p>

                <ul>
                  <li><strong>Industry:</strong> {pitch.industry}</li>
                  <li><strong>Contact:</strong>  {pitch.cell_number}</li>
                </ul>

                <div className="funding-info">
                  <span><strong>Raising Amount:</strong> ${pitch.total_raising_amount}</span>
                  <span><strong>Minimum Investment:</strong> ${pitch.minimum_investment}</span>
                </div>
                <Link to={`/all-pitches/${pitch.id}`}>
                  <button className="find-out-more">Find Out More</button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>No pitches found.</p>
        )}
      </div>
    </div>
  );
};

export default InvestmentPitches;
