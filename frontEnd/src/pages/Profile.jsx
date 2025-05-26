import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext.jsx";
import { useLogout } from "../hooks/useLogout.jsx";
import { Link } from "react-router-dom";
import "../styles/profile.css";

const Profile = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      const token = localStorage.getItem("token");
      console.log(token);

      try {
        const response = await fetch(`http://localhost:8000/api/profile/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserInfo(data);
          console.log(data);
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
    <div className="container">
      <div className="profile-card">
        <div className="profile-row">
          <div className="profile-image">
            <img
              src="src/images/profile.jpeg"
              alt="Profile"
            />
          </div>
          <div className="profile-info">
            <h5 className="profile-name">{user?.name || "No Name Provided"}</h5>
            <p className="profile-location">📍 {userInfo?.location || "Location not set"}</p>
            <ul className="profile-details">
              <li>• Areas of Interest: {userInfo?.areas_of_interest || "N/A"}</li>
              <li>• <strong>Email:</strong> {userInfo?.user.email || "Email not provided"}</li>
            </ul>
          </div>
          <button className="knock-button">Knock</button>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h5 className="card-title">About</h5>
          <p className="card-text">{userInfo?.about || "No bio provided yet."}</p>
        </div>
      </div>

      {user && (
        <div className="action-buttons11">
          <button onClick={handleLogout} className="btn logout">Log out</button>
          <Link to="/profile/edit-profile">
            <button className="btn secondary">Edit Profile</button>
          </Link>
          <Link to="/profile/investor-info">
              <button className="btn secondary">Investor Profile Info</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
