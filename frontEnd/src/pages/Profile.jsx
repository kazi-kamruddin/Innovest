import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import { useLogout } from "../hooks/useLogout.jsx";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaEnvelope } from "react-icons/fa"; 
import "../styles/profile.css";

const Profile = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${API_BASE}/profile/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-pic-wrapper">
          <img src="src/images/profile.jpeg" alt="Profile" className="profile-pic" />
        </div>
        <h2 className="username">
           {user?.name
           ? user.name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
             .join(" ")
            : "No Name Provided"}
        </h2>
       {userInfo?.location && (
          <div className="location-line">
            <FaMapMarkerAlt className="location-icon" />
            <span>{userInfo.location}</span>
          </div>
        )}
      </div>

      <div className="info-section">
        <ul>
        <li><strong>Email:</strong> {user?.email || "Email not provided"}</li>
          <li>
            <strong>Areas of Interest:</strong>
            <div className="interest-boxes">
              {userInfo?.areas_of_interest
                ? userInfo.areas_of_interest.split(",").map((interest, index) => (
                    <span key={index} className="interest-box">
                      {interest.trim()}
                    </span>
                  ))
                : "N/A"}
            </div>
          </li>
        </ul>
      </div>

      <div className="about-section">
        <h3>About</h3>
        <p>{userInfo?.about || "No bio provided yet."}</p>
      </div>

      {user && (
        <div className="action-buttons">
          <button onClick={handleLogout} className="btn logout">Log out</button>
          <Link to="/profile/edit-profile">
            <button className="btn ssecondary">Edit Profile</button>
          </Link>
          <Link to="/profile/investor-info">
            <button className="btn ssecondary">Investor Profile</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
