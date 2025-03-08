import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // To get the user_id from URL
import "../styles/others_profile.css";

const OthersProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const { userId } = useParams();  // Getting userId from the URL
  const token = localStorage.getItem("token")?.trim();

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
        console.log(data);

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
    <div className="others-container">
      {userInfo ? (
        <>
          <div className="others-profile-card">
            <div className="others-profile-row">
              <div className="others-profile-image">
                <img
                  src="https://media.gq-magazine.co.uk/photos/5e96bf31013fff000829de0c/16:9/w_2560%2Cc_limit/GettyImages-1199899108.jpg"
                  alt="Profile"
                />
              </div>
              <div className="others-profile-info">
                <h5 className="others-profile-name">{userInfo?.user.name || "No Name Provided"}</h5>
                <p className="others-profile-location">📍 {userInfo?.location || "Location not set"}</p>
                <ul className="others-profile-details">
                  <li>• Areas of Interest: {userInfo?.areas_of_interest || "N/A"}</li>
                </ul>
              </div>
              <button className="others-knock-button">Knock</button>
            </div>
          </div>

          <div className="others-info-section">
            <div className="others-info-card">
              <h5 className="others-card-title">About</h5>
              <p className="others-card-text">{userInfo?.about || "No bio provided yet."}</p>
            </div>
          </div>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default OthersProfile;
