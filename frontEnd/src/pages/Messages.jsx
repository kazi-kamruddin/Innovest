import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiChevronRight,
  FiInbox,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiUser,
  FiUsers,
  FiWifi,
  FiWifiOff,
  FiX,
} from "react-icons/fi";
import { useAuthContext } from "../hooks/useAuthContext";
import "../styles/messages.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

function sameId(a, b) {
  return a !== null && a !== undefined && b !== null && b !== undefined && String(a) === String(b);
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2) || "?").toUpperCase();
}

function partnerFor(conversation, ownId) {
  if (!conversation) return null;
  const isFirstUser = sameId(conversation.user_one_id, ownId);
  return {
    id: isFirstUser ? conversation.user_two_id : conversation.user_one_id,
    name: (isFirstUser ? conversation.user2_name : conversation.user1_name) || "Innovest member",
  };
}

function normalizeMessage(raw) {
  return {
    ...raw,
    conversation_id: raw.conversation_id ?? raw.conversationId,
    sender_id: raw.sender_id ?? raw.senderId,
    content: raw.content ?? raw.body ?? "",
    created_at: raw.created_at ?? new Date().toISOString(),
  };
}

function messageTimestamp(message) {
  const time = new Date(message?.created_at).getTime();
  return Number.isFinite(time) ? time : 0;
}

// Socket.IO echoes the sender's message after saving it in the database.
// Replace its optimistic bubble rather than adding a second copy.
function mergeMessages(existing, incoming, ownId) {
  const result = [...existing];

  for (const raw of incoming) {
    const message = normalizeMessage(raw);
    const byId = result.findIndex(
      (item) => !item.pending && !item.failed && item.id != null && message.id != null && sameId(item.id, message.id)
    );

    if (byId !== -1) {
      result[byId] = { ...result[byId], ...message, pending: false, failed: false };
      continue;
    }

    const ownMessage = sameId(message.sender_id, ownId);
    const matchingPending = ownMessage
      ? result.findIndex(
          (item) =>
            item.pending &&
            sameId(item.sender_id, ownId) &&
            item.content === message.content &&
            Math.abs(messageTimestamp(item) - messageTimestamp(message)) < 120000
        )
      : -1;

    if (matchingPending !== -1) {
      result[matchingPending] = { ...message, pending: false, failed: false };
    } else {
      result.push({ ...message, pending: false, failed: false });
    }
  }

  return result.sort((a, b) => messageTimestamp(a) - messageTimestamp(b));
}

function timeLabel(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function dayKey(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "unknown";
  return `${parsed.getFullYear()}-${parsed.getMonth()}-${parsed.getDate()}`;
}

function dayLabel(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Messages";

  const today = new Date();
  if (dayKey(today) === dayKey(parsed)) return "Today";

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(yesterday) === dayKey(parsed)) return "Yesterday";

  return parsed.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
}

export default function Messages() {
  const { user } = useAuthContext();
  const userId = user?.id;
  const token = localStorage.getItem("token");

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationError, setConversationError] = useState("");
  const [refreshConversations, setRefreshConversations] = useState(0);

  const [threads, setThreads] = useState({});
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [refreshThread, setRefreshThread] = useState(0);
  const [latestById, setLatestById] = useState({});
  const [unreadIds, setUnreadIds] = useState(() => new Set());

  const [partnerInfo, setPartnerInfo] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendingWithRest, setSendingWithRest] = useState(false);

  const socketRef = useRef(null);
  const selectedIdRef = useRef(null);
  const pendingQueueRef = useRef([]);
  const nextTempIdRef = useRef(0);
  const historyRef = useRef(null);
  const composerRef = useRef(null);

  const selectedConversation = conversations.find((c) => sameId(c.id, selectedId));
  const partner = partnerFor(selectedConversation, userId);
  const partnerId = partner?.id;
  const currentMessages = selectedId == null ? [] : threads[String(selectedId)] || [];

  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (selectedId != null) {
      setUnreadIds((current) => {
        const updated = new Set(current);
        updated.delete(String(selectedId));
        return updated;
      });
    }
  }, [selectedId]);

  // Load only conversations belonging to the authenticated user.
  useEffect(() => {
    if (!userId || !token || !API_BASE) {
      setConversations([]);
      setLoadingConversations(false);
      setConversationError("Sign in to see your conversations.");
      return;
    }

    const controller = new AbortController();
    setLoadingConversations(true);
    setConversationError("");

    (async () => {
      try {
        const response = await fetch(`${API_BASE}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await readJson(response);
        if (!Array.isArray(data)) throw new Error("Unexpected conversations response");
        if (controller.signal.aborted) return;

        setConversations(data);

        // Optional direct links: /messages?conversation=123
        const requestedId = new URLSearchParams(window.location.search).get("conversation");
        if (requestedId && data.some((item) => sameId(item.id, requestedId))) {
          setSelectedId(requestedId);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load conversations:", error);
          setConversationError(error.message || "Couldn't load conversations.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingConversations(false);
      }
    })();

    return () => controller.abort();
  }, [userId, token, refreshConversations]);

  // Real-time messages. The backend emits 'receive_message' to sender AND receiver.
  useEffect(() => {
    if (!userId || !token || !API_BASE) return;

    const socket = io(API_BASE, { auth: { token }, reconnection: true });
    socketRef.current = socket;
    setConnectionStatus("connecting");

    function onConnect() {
      setConnectionStatus("connected");
      setRefreshConversations((value) => value + 1);
      setRefreshThread((value) => value + 1);
    }

    function onDisconnect() {
      setConnectionStatus("reconnecting");
    }

    function onConnectError() {
      setConnectionStatus("unavailable");
    }

    function onReceive(raw) {
      const message = normalizeMessage(raw);
      if (message.conversation_id == null) return;
      const key = String(message.conversation_id);

      if (sameId(message.sender_id, userId)) {
        const queuedIndex = pendingQueueRef.current.findIndex(
          (item) => sameId(item.conversationId, message.conversation_id) && item.content === message.content
        );
        if (queuedIndex !== -1) pendingQueueRef.current.splice(queuedIndex, 1);
      } else if (!sameId(message.conversation_id, selectedIdRef.current)) {
        setUnreadIds((current) => new Set(current).add(key));
      }

      setThreads((current) => ({
        ...current,
        [key]: mergeMessages(current[key] || [], [message], userId),
      }));
      setLatestById((current) => ({
        ...current,
        [key]: messageTimestamp(message) >= messageTimestamp(current[key]) ? message : current[key],
      }));
    }

    function onSendError(payload) {
      const queued = pendingQueueRef.current.shift();
      if (queued) {
        const key = String(queued.conversationId);
        setThreads((current) => ({
          ...current,
          [key]: (current[key] || []).map((message) =>
            message.id === queued.tempId
              ? { ...message, pending: false, failed: true }
              : message
          ),
        }));
      }
      setSendError(payload?.message || "Couldn't send this message. Please try again.");
    }

    function onNewConversation() {
      setRefreshConversations((value) => value + 1);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("receive_message", onReceive);
    socket.on("send_message_error", onSendError);
    socket.on("new_conversation", onNewConversation);

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [userId, token]);

  // Fetch history for the selected conversation. A stale fetch can't replace
  // a new conversation's messages because histories are cached by ID.
  useEffect(() => {
    if (selectedId == null || !token || !API_BASE) {
      setThreadLoading(false);
      return;
    }

    const controller = new AbortController();
    const key = String(selectedId);
    setThreadLoading(true);
    setThreadError("");

    (async () => {
      try {
        const response = await fetch(
          `${API_BASE}/conversations/${encodeURIComponent(selectedId)}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );
        const data = await readJson(response);
        if (!Array.isArray(data)) throw new Error("Unexpected messages response");
        if (controller.signal.aborted) return;

        const normalized = data.map(normalizeMessage);
        setThreads((current) => ({
          ...current,
          [key]: mergeMessages(current[key] || [], normalized, userId),
        }));
        if (normalized.length) {
          setLatestById((current) => {
            const candidate = normalized[normalized.length - 1];
            return {
              ...current,
              [key]: messageTimestamp(candidate) >= messageTimestamp(current[key])
                ? candidate
                : current[key],
            };
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load messages:", error);
          setThreadError(error.message || "Couldn't load messages.");
        }
      } finally {
        if (!controller.signal.aborted) setThreadLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selectedId, userId, token, refreshThread]);

  // Profile information is optional; show the name from conversations if it fails.
  useEffect(() => {
    setPartnerInfo(null);
    if (partnerId == null || !token || !API_BASE) {
      setProfileLoading(false);
      return;
    }

    const controller = new AbortController();
    setProfileLoading(true);

    (async () => {
      try {
        const response = await fetch(
          `${API_BASE}/profile/${encodeURIComponent(partnerId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );
        const data = await readJson(response);
        if (!controller.signal.aborted) setPartnerInfo(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("Profile details are unavailable:", error);
        }
      } finally {
        if (!controller.signal.aborted) setProfileLoading(false);
      }
    })();

    return () => controller.abort();
  }, [partnerId, token]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [selectedId, currentMessages.length, threadLoading]);

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations
      .filter((conversation) =>
        partnerFor(conversation, userId)?.name.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const aTime = messageTimestamp(latestById[String(a.id)] || { created_at: a.created_at });
        const bTime = messageTimestamp(latestById[String(b.id)] || { created_at: b.created_at });
        return bTime - aTime;
      });
  }, [conversations, userId, search, latestById]);

  const interestTags = typeof partnerInfo?.areas_of_interest === "string"
    ? partnerInfo.areas_of_interest.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  function openConversation(conversation) {
    setSelectedId(conversation.id);
    setDraft("");
    setSendError("");
    setThreadError("");
  }

  function restoreFailedMessage(message) {
    if (selectedId == null) return;
    const key = String(selectedId);
    setDraft(message.content);
    setSendError("");
    setThreads((current) => ({
      ...current,
      [key]: (current[key] || []).filter((item) => item.id !== message.id),
    }));
    composerRef.current?.focus();
  }

  async function handleSend(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || selectedId == null || sendingWithRest || !token || !userId) return;

    setSendError("");
    const key = String(selectedId);
    const tempId = `local-${Date.now()}-${++nextTempIdRef.current}`;
    const optimistic = {
      id: tempId,
      conversation_id: selectedId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      pending: true,
      failed: false,
    };

    setThreads((current) => ({
      ...current,
      [key]: [...(current[key] || []), optimistic],
    }));
    setDraft("");

    // Prefer Socket.IO to preserve the existing real-time delivery flow.
    if (socketRef.current?.connected) {
      pendingQueueRef.current.push({ tempId, conversationId: selectedId, content });
      socketRef.current.emit("send_message", { conversationId: selectedId, content });
      return;
    }

    // This REST endpoint already exists. It saves messages when Socket.IO is
    // temporarily unavailable; recipients will see them after refreshing.
    setSendingWithRest(true);
    try {
      const response = await fetch(
        `${API_BASE}/conversations/${encodeURIComponent(selectedId)}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );
      const saved = normalizeMessage(await readJson(response));
      setThreads((current) => ({
        ...current,
        [key]: mergeMessages(current[key] || [], [saved], userId),
      }));
      setLatestById((current) => ({ ...current, [key]: saved }));
    } catch (error) {
      console.error("Failed to send message:", error);
      setThreads((current) => ({
        ...current,
        [key]: (current[key] || []).map((message) =>
          message.id === tempId ? { ...message, pending: false, failed: true } : message
        ),
      }));
      setSendError(error.message || "Message wasn't sent. Try again.");
    } finally {
      setSendingWithRest(false);
    }
  }

  return (
    <main className="iv-messages">
      <div className="iv-msg-page-container">
        <header className="iv-msg-page-heading">
          <div>
            <div className="iv-msg-eyebrow"><span aria-hidden="true" /> INVESTOR CONNECTIONS</div>
            <h1>Messages <em>& conversations.</em></h1>
            <p>Connect with entrepreneurs and investors, all in one place.</p>
          </div>
          <Link to="/investor-list" className="iv-msg-discover">
            <FiUsers size={17} aria-hidden="true" /> Explore investors
            <FiArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </header>

        <section
          className={`iv-msg-workspace ${selectedId != null ? "iv-msg-has-selection" : ""}`}
          aria-label="Messages workspace"
        >
          {/* LEFT - CONVERSATION LIST */}
          <aside className="iv-msg-sidebar" aria-label="Conversations">
            <div className="iv-msg-sidebar-heading">
              <div>
                <h2>Inbox</h2>
                <p>Your connections</p>
              </div>
              <span className="iv-msg-total" aria-label={`${conversations.length} conversations`}>
                {conversations.length}
              </span>
            </div>

            <div className="iv-msg-sidebar-tools">
              <label className="iv-msg-search-box">
                <FiSearch size={17} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search conversations"
                  aria-label="Search conversations"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                    <FiX size={15} aria-hidden="true" />
                  </button>
                )}
              </label>
              <button
                type="button"
                className="iv-msg-refresh"
                aria-label="Refresh conversations"
                title="Refresh conversations"
                onClick={() => setRefreshConversations((value) => value + 1)}
              >
                <FiRefreshCw size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="iv-msg-conversation-list">
              {loadingConversations && conversations.length === 0 ? (
                <div className="iv-msg-list-feedback" role="status">Loading conversations...</div>
              ) : conversationError ? (
                <div className="iv-msg-list-feedback iv-msg-list-error" role="alert">
                  <FiAlertCircle size={20} aria-hidden="true" />
                  <p>{conversationError}</p>
                  <button type="button" onClick={() => setRefreshConversations((value) => value + 1)}>
                    Try again
                  </button>
                </div>
              ) : visibleConversations.length === 0 ? (
                <div className="iv-msg-list-feedback">
                  <FiInbox size={23} aria-hidden="true" />
                  <p>{search ? "No matching conversations." : "No conversations yet."}</p>
                  {!search && <span>Visit a member's profile and use Knock to start a chat.</span>}
                  {!search && <Link to="/investor-list">Find people <FiArrowRight size={14} aria-hidden="true" /></Link>}
                </div>
              ) : (
                visibleConversations.map((conversation) => {
                  const itemPartner = partnerFor(conversation, userId);
                  const preview = latestById[String(conversation.id)];
                  const active = sameId(selectedId, conversation.id);
                  const unread = unreadIds.has(String(conversation.id));

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={`iv-msg-conversation ${active ? "iv-msg-conversation-active" : ""}`}
                      onClick={() => openConversation(conversation)}
                      aria-current={active ? "true" : undefined}
                    >
                      <span className="iv-msg-avatar" aria-hidden="true">{initials(itemPartner.name)}</span>
                      <span className="iv-msg-conversation-copy">
                        <span className="iv-msg-conversation-name">{itemPartner.name}</span>
                        <span className="iv-msg-conversation-preview">
                          {preview ? preview.content : "Open conversation"}
                        </span>
                      </span>
                      <span className="iv-msg-conversation-trailing">
                        {preview && <span className="iv-msg-preview-time">{timeLabel(preview.created_at)}</span>}
                        {unread && <span className="iv-msg-unread-dot" aria-label="New message" />}
                        {!unread && <FiChevronRight size={15} aria-hidden="true" />}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="iv-msg-sidebar-bottom">
              <FiMessageCircle size={15} aria-hidden="true" />
              Conversations are private to participants
            </div>
          </aside>

          {/* CENTER - CHAT */}
          <section className="iv-msg-chat" aria-label="Chat">
            {!selectedConversation ? (
              <div className="iv-msg-select-prompt">
                <div className="iv-msg-empty-graphic" aria-hidden="true"><FiMessageCircle size={34} /></div>
                <h2>Your next conversation starts here.</h2>
                <p>Select a conversation from your inbox to read and send messages.</p>
                <Link to="/investor-list">Discover investors <FiArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            ) : (
              <>
                <div className="iv-msg-chat-heading">
                  <button
                    type="button"
                    className="iv-msg-mobile-back"
                    onClick={() => setSelectedId(null)}
                    aria-label="Back to conversations"
                  >
                    <FiArrowLeft size={18} aria-hidden="true" />
                  </button>
                  <span className="iv-msg-avatar iv-msg-avatar-header" aria-hidden="true">{initials(partner.name)}</span>
                  <div className="iv-msg-chat-heading-copy">
                    <h2>{partnerInfo?.user?.name || partner.name}</h2>
                    <p>Private conversation</p>
                  </div>
                  <div
                    className={`iv-msg-connection iv-msg-connection-${connectionStatus}`}
                    title={connectionStatus === "connected" ? "Realtime connection is active" : "Realtime connection is unavailable"}
                  >
                    {connectionStatus === "connected" ? <FiWifi size={14} aria-hidden="true" /> : <FiWifiOff size={14} aria-hidden="true" />}
                    <span>{connectionStatus === "connected" ? "Live" : "Reconnecting"}</span>
                  </div>
                </div>

                <div className="iv-msg-message-history" ref={historyRef} aria-label="Message history" role="log" aria-live="polite" aria-relevant="additions text">
                  {threadLoading && currentMessages.length === 0 ? (
                    <div className="iv-msg-thread-note" role="status">Loading messages...</div>
                  ) : threadError && currentMessages.length === 0 ? (
                    <div className="iv-msg-thread-note iv-msg-thread-error" role="alert">
                      <FiAlertCircle size={19} aria-hidden="true" />
                      <span>{threadError}</span>
                      <button type="button" onClick={() => setRefreshThread((value) => value + 1)}>Retry</button>
                    </div>
                  ) : currentMessages.length === 0 ? (
                    <div className="iv-msg-thread-empty">
                      <span><FiMessageCircle size={23} aria-hidden="true" /></span>
                      <h3>Say hello to {partner.name}.</h3>
                      <p>Send the first message to get the conversation started.</p>
                    </div>
                  ) : (
                    currentMessages.map((message, index) => {
                      const own = sameId(message.sender_id, userId);
                      const newDay = index === 0 || dayKey(currentMessages[index - 1].created_at) !== dayKey(message.created_at);
                      return (
                        <div key={message.id ?? `message-${index}`} className="iv-msg-message-group">
                          {newDay && <div className="iv-msg-date-divider"><span>{dayLabel(message.created_at)}</span></div>}
                          <div className={`iv-msg-bubble-row ${own ? "iv-msg-own" : "iv-msg-other"}`}>
                            <div className={`iv-msg-bubble ${message.failed ? "iv-msg-bubble-failed" : ""}`}>
                              <p>{message.content}</p>
                              <div className="iv-msg-bubble-meta">
                                <span>{timeLabel(message.created_at)}</span>
                                {message.pending ? (
                                  <span>Sending...</span>
                                ) : message.failed ? (
                                  <button type="button" onClick={() => restoreFailedMessage(message)}>Not sent · Retry</button>
                                ) : own ? (
                                  <FiCheck size={13} aria-label="Saved" />
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="iv-msg-composer-area">
                  {sendError && (
                    <div className="iv-msg-send-error" role="alert">
                      <FiAlertCircle size={15} aria-hidden="true" />
                      <span>{sendError}</span>
                      <button type="button" onClick={() => setSendError("")} aria-label="Dismiss error"><FiX size={14} /></button>
                    </div>
                  )}
                  {connectionStatus !== "connected" && (
                    <div className="iv-msg-offline-note">
                      Live delivery is unavailable. Messages can still be saved, but the recipient may need to refresh to see them.
                    </div>
                  )}
                  <form className="iv-msg-composer" onSubmit={handleSend}>
                    <textarea
                      ref={composerRef}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                          event.preventDefault();
                          if (draft.trim()) event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      rows={2}
                      aria-label="Write a message"
                      placeholder={`Message ${partner.name}...`}
                    />
                    <button type="submit" className="iv-msg-send" disabled={!draft.trim() || sendingWithRest}>
                      <FiSend size={17} aria-hidden="true" /> <span>Send</span>
                    </button>
                  </form>
                  <p className="iv-msg-composer-hint">Enter to send · Shift + Enter for a new line</p>
                </div>
              </>
            )}
          </section>

          {/* RIGHT - CONNECTION DETAILS */}
          <aside className="iv-msg-details" aria-label="Connection details">
            {partner ? (
              <>
                <div className="iv-msg-details-top">
                  <span className="iv-msg-details-avatar" aria-hidden="true">{initials(partnerInfo?.user?.name || partner.name)}</span>
                  <h2>{partnerInfo?.user?.name || partner.name}</h2>
                  <p>Innovest member</p>
                  <Link to={`/profile/${partnerId}`} className="iv-msg-profile-link">
                    View profile <FiArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
                <div className="iv-msg-details-body">
                  <h3>About this connection</h3>
                  {profileLoading ? (
                    <p className="iv-msg-profile-loading">Loading profile...</p>
                  ) : (
                    <>
                      {partnerInfo?.location && (
                        <div className="iv-msg-info-row"><FiMapPin size={16} aria-hidden="true" /><span>{partnerInfo.location}</span></div>
                      )}
                      {partnerInfo?.user?.email && (
                        <div className="iv-msg-info-row"><FiMail size={16} aria-hidden="true" /><span>{partnerInfo.user.email}</span></div>
                      )}
                      {partnerInfo?.about && (
                        <div className="iv-msg-about"><h4>Bio</h4><p>{partnerInfo.about}</p></div>
                      )}
                      {interestTags.length > 0 && (
                        <div className="iv-msg-interests"><h4>Interests</h4><div>{interestTags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
                      )}
                      {!partnerInfo?.location && !partnerInfo?.user?.email && !partnerInfo?.about && interestTags.length === 0 && (
                        <p className="iv-msg-profile-loading">Visit the member's profile to learn more.</p>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="iv-msg-detail-placeholder">
                <span><FiUser size={23} aria-hidden="true" /></span>
                <h2>Connection details</h2>
                <p>Select a conversation to see more about the person you're chatting with.</p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
