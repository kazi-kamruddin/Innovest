import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import "../styles/profile-others.css";
import profileImage from "../assets/profile.jpeg";

const ProfileOthers = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [investorInfo, setInvestorInfo] = useState(null);
  const { userId } = useParams();
  const token = localStorage.getItem("token");
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) setUserInfo(profileData);

        const investorRes = await fetch(`${API_BASE}/investor-info/public/${userId}`);
        const investorData = await investorRes.json();
        if (investorRes.ok && investorData?.id) setInvestorInfo(investorData);
      } catch (err) {
        console.error("Error fetching profile or investor info:", err);
      }
    };

    fetchData();
  }, [userId]);

  if (!userInfo) return <p>Loading profile...</p>;

  return (
    <div className="others-profile-container">
      <div className="others-profile-header" style={{ position: "relative" }}>
        {investorInfo?.id && (
          <div className="others-investor-badge">Investor</div>
        )}

        <div className="others-profile-pic-wrapper">
          <img src={profileImage} alt="Profile" className="others-profile-pic" />
        </div>

        <h2 className="others-username">
          {userInfo?.user?.name || userInfo?.name || "No Name Provided"}
        </h2>

        {userInfo?.location && (
          <div className="others-location-line">
            <FaMapMarkerAlt className="others-location-icon" />
            <span>{userInfo.location}</span>
          </div>
        )}

        <button className="others-knock-btn">
          <FaEnvelope className="others-knock-icon" />
          Knock
        </button>
      </div>

      <div className="others-info-section">
        <ul>
          <li><strong>Email:</strong> {userInfo?.user?.email || userInfo?.email || "Email not provided"}</li>
          <li>
            <strong>Areas of Interest:</strong>
            <div className="others-interest-boxes">
              {userInfo?.areas_of_interest
                ? userInfo.areas_of_interest.split(",").map((interest, idx) => (
                    <span key={idx} className="others-interest-box">{interest.trim()}</span>
                  ))
                : "N/A"}
            </div>
          </li>
        </ul>
      </div>

      <div className="others-about-section">
        <h3>About</h3>
        <p>{userInfo?.about || "No bio provided yet."}</p>
      </div>
    </div>
  );
};

export default ProfileOthers;
