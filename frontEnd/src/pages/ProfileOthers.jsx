import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import "../styles/profile-others.css";
import profileImage from "../assets/profile.jpeg";

const ProfileOthers = () => {
  const [userInfo, setUserInfo] = useState(null);
  const { userId } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/profile/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserInfo(data);
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [userId]);

  return (
    <div className="others-profile-container">
      {userInfo ? (
        <>
          <div className="others-profile-header">
            <div className="others-profile-pic-wrapper">
              <img src={profileImage} alt="Profile" className="others-profile-pic" />
            </div>
            <h2 className="others-username">{userInfo?.user.name || "No Name Provided"}</h2>
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
              <li><strong>Email:</strong> {userInfo?.user.email || "Email not provided"}</li>
              <li>
                <strong>Areas of Interest:</strong>
                <div className="others-interest-boxes">
                  {userInfo?.areas_of_interest
                    ? userInfo.areas_of_interest.split(",").map((interest, index) => (
                        <span key={index} className="others-interest-box">
                          {interest.trim()}
                        </span>
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
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default ProfileOthers;
