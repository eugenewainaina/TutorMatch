import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SERVER_URL } from "../config";
import { requestFirebaseNotificationPermission } from "../notifications/firebase";
import "./ChatScreen.css";

// Format date for message grouping
const formatMessageDate = (timestamp) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
};

// Format time for individual messages
const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Message = ({ message, isLastInGroup, onRetry }) => {
  const { sender_role, message: text, timestamp, status } = message;
  const isOther = sender_role === "other";

  return (
    <div
      className={`message-wrapper ${isOther ? "other" : "self"}`}
      data-oid="-f_2w.w"
    >
      <div
        className={`message ${isOther ? "other-message" : "self-message"} ${status ? status : ""}`}
        data-oid="2vr77c9"
      >
        <div className="message-text" data-oid="fyh_er6">
          {text}
        </div>
        <div className="message-time" data-oid="1f0cs1l">
          {formatMessageTime(timestamp)}
        </div>
        {status === "failed" && (
          <div className="message-retry" data-oid="i8tx614">
            <button
              className="retry-button"
              onClick={(e) => {
                e.stopPropagation();
                onRetry(message);
              }}
              title="Retry sending message"
              data-oid="sc:.pj3"
            >
              Retry ↻
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DateSeparator = ({ date }) => {
  return (
    <div className="date-separator" data-oid="j7l.mf-">
      <div className="date-pill" data-oid="lm_o8p7">
        {date}
      </div>
    </div>
  );
};

const ChatInput = React.forwardRef(({ onSend, isLoading }, inputRef) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form
      className="chat-input-form"
      onSubmit={handleSubmit}
      data-oid="thegyqw"
    >
      <input
        ref={inputRef}
        type="text"
        className="chat-input"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
        data-oid="bzbyybi"
      />

      <button
        type="submit"
        className={`send-button ${isLoading ? "disabled" : ""}`}
        disabled={isLoading || !message.trim()}
        data-oid=".fgbwn3"
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </form>
  );
});

const ChatScreen = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [chatName, setChatName] = useState("");
  const chatContainerRef = useRef(null);
  const chatInputRef = useRef(null);

  // Request notification permission when chat screen is opened
  useEffect(() => {
    requestFirebaseNotificationPermission()
      .then((permission) => {
        console.log(
          "ChatScreen: Firebase notification permission status:",
          permission,
        );
      })
      .catch((err) => {
        console.error(
          "ChatScreen: Error requesting notification permission:",
          err,
        );
      });
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${SERVER_URL}/8d7c1b4b-fdd9-4f69-b5e9-403e994725ba/messages/${id}`,
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }

        // Check if response has content
        const text = await response.text();
        if (!text) {
          // Empty response means no messages
          setMessages([]);
        } else {
          // Parse messages and order by timestamp (oldest first)
          const data = JSON.parse(text);
          const sortedMessages = Array.isArray(data)
            ? [...data].sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
              )
            : [];
          setMessages(sortedMessages);
        }

        // Fetch chat name
        const chatResponse = await fetch(`${SERVER_URL}/chats`, {
          credentials: "include",
        });

        if (chatResponse.ok) {
          const chats = await chatResponse.json();
          const currentChat = chats.find((chat) => chat.id === id);
          if (currentChat) {
            setChatName(currentChat.name);
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (messageText) => {
    try {
      setSendingMessage(true);

      // Add message to UI immediately for responsive feel
      const tempMessage = {
        sender_role: "",
        message: messageText,
        timestamp: new Date().toISOString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Send message to server
      const response = await fetch(`${SERVER_URL}/send_message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: messageText,
          other_id: id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      // Update message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg === tempMessage ? { ...msg, status: "sent" } : msg,
        ),
      );
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");

      // Update message status to failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.status === "sending" ? { ...msg, status: "failed" } : msg,
        ),
      );
    } finally {
      setSendingMessage(false);
      // Focus input after sending
      chatInputRef.current?.focus();
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message) => {
      const messageDate = formatMessageDate(message.timestamp);

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentGroup,
          });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentGroup,
      });
    }

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (loading) {
    return (
      <div className="chat-loading" data-oid="e4wzx6j">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="chat-screen" data-oid="4g_:j1h">
      <div className="chat-header" data-oid="6x:8ah1">
        <h2 data-oid="svdprp-">{chatName || "Chat"}</h2>
      </div>

      <div ref={chatContainerRef} className="chat-messages" data-oid="a.pvnn5">
        {messageGroups.length === 0 ? (
          <div className="no-messages" data-oid="z_5u:wx">
            <p data-oid="zfqfvkb">
              No messages yet. Send a message to start the conversation!
            </p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div
              key={`group-${groupIndex}`}
              className="message-group"
              data-oid="e:aj6x8"
            >
              <DateSeparator date={group.date} data-oid="tqtei73" />
              {group.messages.map((msg, msgIndex) => (
                <Message
                  key={`msg-${groupIndex}-${msgIndex}`}
                  message={msg}
                  isLastInGroup={msgIndex === group.messages.length - 1}
                  onRetry={(failedMsg) => handleSendMessage(failedMsg.message)}
                  data-oid="hui9_ah"
                />
              ))}
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="floating-error-message" data-oid="3:no2k4">
          <div className="error-content" data-oid="4g-1hkk">
            <span data-oid=".wjpvpc">{error}</span>
            <button
              className="close-error"
              onClick={() => setError(null)}
              title="Dismiss"
              data-oid="bnqmo_g"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ChatInput
        ref={chatInputRef}
        onSend={handleSendMessage}
        isLoading={sendingMessage}
        data-oid="wey8.su"
      />
    </div>
  );
};

export default ChatScreen;
