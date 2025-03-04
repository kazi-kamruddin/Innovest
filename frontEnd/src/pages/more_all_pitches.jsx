import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/more_all_pitches.css";
import pitchImage from "../assets/pitch_investor.jpg"; 

const MoreAllPitches = () => {
  const [pitch, setPitch] = useState(null);
  const { id } = useParams();  

  useEffect(() => {
    
    fetch(`http://127.0.0.1:8000/api/pitches/${id}`)
      .then((response) => response.json())
      .then((data) => setPitch(data))
      .catch((error) => console.error("Error fetching pitch:", error));
  }, [id]); 

  if (!pitch) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pitch-details-container1">
   {/* Image Section */}
   <div className="pitch-image-container">
        <img src={pitchImage} alt="Pitch Image" className="pitch-image" /> {/* Use the imported image */}
      </div>
      <h1 className="pitch-details-title1">More Information About the Pitch</h1>
      
      <div className="pitch-info-card1">
        <h2 className="pitch-info-title1">{pitch.title}</h2>
        <p className="pitch-info-location1"><strong>Location:</strong> {pitch.company_location}, {pitch.country}</p>
        <p className="pitch-info-contact1"><strong>Contact:</strong> 📞 {pitch.cell_number}</p>
        <p className="pitch-info-industry1"><strong>Industry:</strong> {pitch.industry}</p>
        <p className="pitch-info-stage1"><strong>Stage:</strong> {pitch.stage}</p>
        <p className="pitch-info-investor-role1"><strong>Investor Role:</strong> {pitch.ideal_investor_role}</p>
        <p className="pitch-info-amount1"><strong>Total Raising Amount:</strong> ${pitch.total_raising_amount}</p>
        <p className="pitch-info-investment1"><strong>Minimum Investment:</strong> ${pitch.minimum_investment}</p>
        <p className="pitch-info-business1"><strong>Business Overview:</strong> {pitch.the_business}</p>
        <p className="pitch-info-market1"><strong>Market:</strong> {pitch.the_market}</p>
        <p className="pitch-info-progress1"><strong>Progress:</strong> {pitch.progress}</p>
        <p className="pitch-info-objective1"><strong>Objective:</strong> {pitch.objective}</p>
      </div>
    </div>
  );
};

export default MoreAllPitches;
