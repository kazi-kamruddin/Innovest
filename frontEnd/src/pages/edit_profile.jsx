// src/pages/EditProfile.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/edit_profile.css";

const EditProfile = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [investmentFrom, setInvestmentFrom] = useState("");
  const [investmentTo, setInvestmentTo] = useState("");
  const [areasOfInterest, setAreasOfInterest] = useState([]);
  const [about, setAbout] = useState("");

  const interestOptions = ["Technology", "Finance", "Healthcare", "Real-Estate", "Retail"];

  const handleCheckboxChange = (option) => {
    setAreasOfInterest((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profileData = { name, location, investmentFrom, investmentTo, areasOfInterest, about };
    console.log("Updated Profile:", profileData);
  };

  return (
    <div className="editProfile-page">
      <h1>Edit Profile</h1>
      <form className="editProfile-form" onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>From:</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />

        <label>Investment Range:</label>
        <div className="investment-range">
          <input type="number" value={investmentFrom} onChange={(e) => setInvestmentFrom(e.target.value)} placeholder="From" required />
          <input type="number" value={investmentTo} onChange={(e) => setInvestmentTo(e.target.value)} placeholder="To" required />
        </div>

        <label>Areas of Interest:</label>
        <div className="interests">
          {interestOptions.map((option) => (
           <label key={option}>
           <span className="interest-text">{option}</span>
           <input
             type="checkbox"
             checked={areasOfInterest.includes(option)}
             onChange={() => handleCheckboxChange(option)}
           />
         </label>
         
          ))}
        </div>

        <label>About:</label>
        <textarea value={about} onChange={(e) => setAbout(e.target.value)} required />

        <button type="submit">Update Profile</button>
      </form>
      <button onClick={() => navigate(-1)} className="back-btn">Back</button>
    </div>
  );
};

export default EditProfile;
