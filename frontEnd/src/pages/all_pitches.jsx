import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/all_pitches.css";

const InvestmentPitches = () => {
  const [pitches, setPitches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for the filter dropdowns
  const [industryFilter, setIndustryFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  // Fetch all pitches with filters
  useEffect(() => {
    const fetchFilteredPitches = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/pitches?industry=${industryFilter}&stage=${stageFilter}&country=${countryFilter}`
        );
        const data = await response.json();
        setPitches(data);
      } catch (error) {
        console.error("Error fetching pitches:", error);
        setPitches([]);
      }
    };

    fetchFilteredPitches();
  }, [industryFilter, stageFilter, countryFilter]); // Re-fetch pitches when a filter changes

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

      <div className="filters">
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
        >
          <option value="">Filter by Industry</option>
          {/* Add the actual industry options here */}
          <option value="Tech">Tech</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
        </select>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">Filter by Stage</option>
          <option value="Seed">Seed</option>
          <option value="Growth">Growth</option>
          <option value="Mature">Mature</option>
        </select>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
        >
          <option value="">Filter by Country</option>
          <option value="USA">USA</option>
          <option value="Canada">Canada</option>
          <option value="UK">UK</option>
        </select>
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
