import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import "../styles/messages.css";

const Messages = () => {
  const { user } = useAuthContext();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!user || !user.id) {
      console.log("\n\nUser not logged in");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get("http://127.0.0.1:8000/api/conversations", { headers })
      .then((res) => {
        console.log("Conversations fetched:", res.data);
        setConversations(res.data);
      })
      .catch((err) => console.error("Error fetching conversations:", err));

    axios
      .get(`http://127.0.0.1:8000/api/profile/${user.id}`, { headers })
      .then((res) => {
        console.log("\n\nUser info fetched:", res.data);
        setUserInfo(res.data);
      })
      .catch((err) => console.error("\n\nError fetching user info:", err));
  }, [user]);


  useEffect(() => {
    if (!selectedConversation) return;

    console.log("\n\nselected conversation id:", selectedConversation.id);

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(
          `http://127.0.0.1:8000/api/conversations/${selectedConversation.id}`,
          { headers }
        );
        setMessages(res.data);
        console.log("\n\nFetched messages:", res.data);
      } catch (err) {
        console.error("\n\nError fetching messages:", err);
      }
    };

    const fetchPartnerInfo = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/profile/${selectedConversation.partner.id}`,
          { headers }
        );
        setPartnerInfo(res.data);
        console.log("\n\nFetched partner info:", res.data);
      } catch (err) {
        console.error("\n\nError fetching partner info:", err);
      }
    };

    fetchMessages();
    fetchPartnerInfo();
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(
        `http://127.0.0.1:8000/api/conversations/${selectedConversation.id}/messages`,
        { body: newMessage },
        { headers }
      );

      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("\n\nError sending message:", err);
    }
  };

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        {/* Left column: Conversation list */}
        <div className="messaging-left-column">
          {conversations.length === 0 ? (
            <p>No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-preview ${
                  selectedConversation?.id === conv.id ? "selected" : ""
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="partner-name">{conv.partner.name}</div>
                {/* <div className="latest-message">
                  {conv.messages?.[0]?.body ?? "No messages yet"}
                </div> */}
              </div>
            ))
          )}
        </div>

        {/* Middle column: Chat area */}
        <div className="messaging-middle-column">
          {selectedConversation ? (
            <>
              <h3 className="chat-header">
                Chat with {selectedConversation.partner.name}
              </h3>
              <div className="message-history">
                {Array.isArray(messages) && messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-bubble ${
                        msg.sender_id === user.id ? "sent" : "received"
                      }`}
                    >
                      {msg.body}
                    </div>
                  ))
                ) : (
                  <div className="no-messages">No messages yet</div>
                )}
              </div>

              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button type="submit" className="send-button">
                  Send
                </button>
              </form>
            </>
          ) : (
            <p>Select a conversation to start chatting</p>
          )}
        </div>


        {/* Right column: Placeholder for partner info */}
        <div className="messaging-right-column">
          {partnerInfo ? (
            <>
              <h4>{partnerInfo.user.name}</h4>
              <p>Email: {partnerInfo.user.email}</p>
            </>
          ) : (
            <p>Loading user info...</p>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Messages;
