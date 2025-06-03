import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import '../styles/messages.css';

const Messages = () => {
  const { user } = useAuthContext();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [investorInfo, setInvestorInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!user || !user.id) {
      console.log("User not logged in");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };


    axios.get("http://127.0.0.1:8000/api/conversations", { headers })
      .then(res => {
        console.log("Conversations fetched:", res.data);
        setConversations(res.data);
      })
      .catch(err => console.error("Error fetching conversations:", err));


    axios.get(`http://127.0.0.1:8000/api/profile/${user.id}`, { headers })
      .then(res => {
        console.log("User info fetched:", res.data);
        setUserInfo(res.data);
      })
      .catch(err => console.error("Error fetching user info:", err));

  }, [user, conversations.length]);

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        <div className="messaging-left-column">Conversations (check console)</div>
        <div className="messaging-middle-column">Chat Area (check console)</div>
        <div className="messaging-right-column">User Info (check console)</div>
      </div>
    </div>
  );
};

export default Messages;
