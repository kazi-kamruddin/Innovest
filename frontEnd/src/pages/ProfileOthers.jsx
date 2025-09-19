import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import "../styles/profile-others.css";
import profileImage from "../assets/profile.jpeg";
import { useAuthContext } from "../hooks/useAuthContext";
import { io } from "socket.io-client";

let socket;

const ProfileOthers = () => {
  const [userInfo, setUserInfo] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { user } = useAuthContext();
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!socket) {
      socket = io(API_BASE, {
        auth: { token },
      });
    }

    if (user) {
      socket.emit("user_connected", user.id);
    }
  }, [user, API_BASE, token]);

  const handleKnock = () => {
    if (!user) return alert("You need to be logged in to knock!");
    if (!userInfo || !socket) return;

    socket.emit("knock_user", {
      senderId: user.id,
      receiverId: userInfo.user.id,
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("new_conversation", ({ conversationId }) => {
      console.log("Knock successful! Conversation:", conversationId);
      navigate("/messages");
    });

    socket.on("knock_error", ({ message }) => {
      console.error("Knock failed:", message);
    });

    return () => {
      socket.off("new_conversation");
      socket.off("knock_error");
    };
  }, [navigate]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE}/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setUserInfo(response.ok ? data : null);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [userId, API_BASE, token]);

  return (
    <div className="others-profile-container">
      {userInfo ? (
        <>
          <div className="others-profile-header">
            <div className="others-profile-pic-wrapper">
              <img
                src={profileImage}
                alt="Profile"
                className="others-profile-pic"
              />
            </div>
            <h2 className="others-username">
              {userInfo?.user.name || "No Name Provided"}
            </h2>
            {userInfo?.location && (
              <div className="others-location-line">
                <FaMapMarkerAlt className="others-location-icon" />
                <span>{userInfo.location}</span>
              </div>
            )}
            <button className="others-knock-btn" onClick={handleKnock}>
              <FaEnvelope className="others-knock-icon" /> Knock
            </button>
          </div>

          <div className="others-info-section">
            <ul>
              <li>
                <strong>Email:</strong>{" "}
                {userInfo?.user.email || "Email not provided"}
              </li>
              <li>
                <strong>Areas of Interest:</strong>
                <div className="others-interest-boxes">
                  {userInfo?.areas_of_interest
                    ? userInfo.areas_of_interest
                        .split(",")
                        .map((interest, index) => (
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
