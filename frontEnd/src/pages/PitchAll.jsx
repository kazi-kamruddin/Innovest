import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/pitch-all.css";
import { FaIndustry, FaMapMarkerAlt, FaLayerGroup } from 'react-icons/fa';

const PitchAll = () => {
  const [pitches, setPitches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [industryFilter, setIndustryFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

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
  }, [industryFilter, stageFilter, countryFilter]);

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

      <div className="filter-section">
        <div className="filter-item">
          <FaIndustry className="filter-icon" />
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
          >
            <option value="">Filter by Industry</option>
            <option value="Tech">Tech</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        <div className="filter-item">
          <FaLayerGroup className="filter-icon" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">Filter by Stage</option>
            <option value="Seed">Seed</option>
            <option value="Growth">Growth</option>
            <option value="Mature">Mature</option>
          </select>
        </div>

        <div className="filter-item">
          <FaMapMarkerAlt className="filter-icon" />
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
                <Link to={`/pitches/${pitch.id}`}>
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

export default PitchAll;
