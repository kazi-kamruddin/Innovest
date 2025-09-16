import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/pitch-single.css";
import pitchImage from "../assets/pitch_investor.jpg";
import {FaMapMarkerAlt,FaPhoneAlt,FaIndustry,FaLayerGroup,FaDollarSign,FaBriefcase,FaChartLine,FaBullseye} from "react-icons/fa";

const PitchSingle = () => {
  const [pitch, setPitch] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_BASE}/pitches/${id}`)
      .then((response) => response.json())
      .then((data) => setPitch(data))
      .catch((error) => console.error("Error fetching pitch:", error));
  }, [id]);

  if (!pitch) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pitch-details-container1">
      <div className="pitch-image-container">
        <img src={pitchImage} alt="Pitch Image" className="pitch-image" />
      </div>

      <h1 className="pitch-details-title1">More Information About the Pitch</h1>

      <div className="pitch-info-card1">
        <h2 className="pitch-info-title1">{pitch.title}</h2>

        <p className="pitch-info-location1">
          <FaMapMarkerAlt /> <strong>Location:</strong> {pitch.company_location}, {pitch.country}
        </p>
        <p className="pitch-info-contact1">
          <FaPhoneAlt /> <strong>Contact:</strong> 📞 {pitch.cell_number}
        </p>
        <p className="pitch-info-industry1">
          <FaIndustry /> <strong>Industry:</strong> {pitch.industry}
        </p>
        <p className="pitch-info-stage1">
          <FaLayerGroup /> <strong>Stage:</strong> {pitch.stage}
        </p>
        <p className="pitch-info-investor-role1">
          <FaBriefcase /> <strong>Investor Role:</strong> {pitch.ideal_investor_role}
        </p>
        <p className="pitch-info-amount1">
          <FaDollarSign /> <strong>Total Raising Amount:</strong> ${pitch.total_raising_amount}
        </p>
        <p className="pitch-info-investment1">
          <FaDollarSign /> <strong>Minimum Investment:</strong> ${pitch.minimum_investment}
        </p>
        <p className="pitch-info-business1">
          <FaBriefcase /> <strong>Business Overview:</strong> {pitch.the_business}
        </p>
        <p className="pitch-info-market1">
          <FaChartLine /> <strong>Market:</strong> {pitch.the_market}
        </p>
        <p className="pitch-info-progress1">
          <FaBullseye /> <strong>Progress:</strong> {pitch.progress}
        </p>
        <p className="pitch-info-objective1">
          <FaBullseye /> <strong>Objective:</strong> {pitch.objective}
        </p>
      </div>

      <button
        className="view-profile-button"
        onClick={() => navigate(`/profile/${pitch.user_id}`)}
      >
        View Profile
      </button>
    </div>
  );
};

export default PitchSingle;
