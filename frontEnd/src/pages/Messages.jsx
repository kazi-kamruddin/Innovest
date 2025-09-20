import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { io } from "socket.io-client";
import "../styles/messages.css";

let socket;

const Messages = () => {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partnerInfo, setPartnerInfo] = useState(null);
  const token = localStorage.getItem("token");
  const API_BASE = import.meta.env.VITE_API_URL;

  const messageHistoryRef = useRef(null);

  const scrollToBottom = () => {
    if (messageHistoryRef.current) {
      messageHistoryRef.current.scrollTop =
        messageHistoryRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  useEffect(() => {
    if (!user) return;

    if (!socket) socket = io(API_BASE, { auth: { token } });

    socket.emit("user_connected", user.id);

    socket.on("receive_message", (msg) => {
      const normalized = {
        ...msg,
        sender_id: msg.sender_id ?? msg.senderId,
        created_at: msg.created_at ?? new Date(),
      };

      if (normalized.sender_id === user.id) return;

      if (normalized.conversationId === selectedConversation?.id) {
        setMessages((prev) => [...prev, normalized]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [user, selectedConversation]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_BASE}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setConversations(data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };
    fetchConversations();
  }, [API_BASE, token]);

  const loadConversation = async (conversation) => {
    setSelectedConversation(conversation);

    try {
      const res = await fetch(
        `${API_BASE}/conversations/${conversation.id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        const normalized = data.map((m) => ({
          ...m,
          sender_id: m.sender_id ?? m.senderId,
        }));
        setMessages(normalized);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }

    const partnerId =
      conversation.user_one_id === user.id
        ? conversation.user_two_id
        : conversation.user_one_id;

    try {
      const res = await fetch(`${API_BASE}/profile/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPartnerInfo(data);
    } catch (err) {
      console.error("Error fetching partner info:", err);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const msg = {
      conversationId: selectedConversation.id,
      senderId: user.id,
      sender_id: user.id,
      content: newMessage,
      created_at: new Date(),
    };

    socket.emit("send_message", msg);

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        {/* Left column: Conversations */}
        <div className="messaging-left-column">
          <h3>Conversations</h3>
          {conversations.length === 0 && <p>No conversations yet.</p>}
          {conversations.map((c) => {
            const partner =
              c.user_one_id === user.id
                ? { id: c.user_two_id, name: c.user2_name }
                : { id: c.user_one_id, name: c.user1_name };
            return (
              <div
                key={c.id}
                className={`conversation-preview ${
                  selectedConversation?.id === c.id ? "selected" : ""
                }`}
                onClick={() => loadConversation(c)}
              >
                <div className="partner-name">{partner.name}</div>
              </div>
            );
          })}
        </div>

        {/* Middle column: Chat */}
        <div className="messaging-middle-column">
          {selectedConversation ? (
            <>
              <h3 className="chat-header">
                Chat with {partnerInfo?.user?.name || "Loading..."}
              </h3>
              <div className="message-history" ref={messageHistoryRef}>
                {messages.length === 0 && (
                  <div className="no-messages">No messages yet</div>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id || Math.random()}
                    className={`message-bubble ${
                      m.sender_id === user.id ? "sent" : "received"
                    }`}
                  >
                    {m.content || m.body}
                    <small className="message-time">
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                ))}
              </div>

              <div className="message-form">
                <input
                  type="text"
                  className="message-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSendMessage()
                  }
                />
                <button className="send-button" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <p>Select a conversation to start chatting</p>
          )}
        </div>

        {/* Right column: Partner info */}
        <div className="messaging-right-column">
          {partnerInfo ? (
            <>
              <h4>{partnerInfo.user.name}</h4>
              <p>Email: {partnerInfo.user.email}</p>
            </>
          ) : (
            <p>User Info will be shown here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
