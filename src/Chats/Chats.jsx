import React, { useEffect, useState } from "react";
import { SERVER_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { requestFirebaseNotificationPermission } from "../notifications/firebase";
import "./Chats.css";

const formatMessageTime = (timestamp) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const time = messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if it's today
  if (messageDate.toDateString() === today.toDateString()) {
    return { day: "Today", time };
  }
  // Check if it's yesterday
  else if (messageDate.toDateString() === yesterday.toDateString()) {
    return { day: "Yesterday", time };
  }
  // It's from earlier this week
  else {
    // Get the day of the week
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayOfWeek = days[messageDate.getDay()];
    return { day: dayOfWeek, time };
  }
};

const ChatRow = ({ chat, onClick }) => {
  const { id, profile_picture, name, message } = chat;
  const isOtherSender = message.sender_role === "other";
  const formattedTime = formatMessageTime(message.timestamp);

  return (
    <div className="chat-row" onClick={() => onClick(id)} data-oid="mw16:k9">
      <div className="chat-avatar" data-oid="le-e4yz">
        {profile_picture ? (
          <img
            src={profile_picture}
            alt={`${name}'s avatar`}
            data-oid="mj7k4o9"
          />
        ) : (
          <div className="default-avatar" data-oid="lme138-">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <div className="chat-content" data-oid="n_8g.ll">
        <div className="chat-name" data-oid="etcih.:">
          {name}
        </div>
        <div
          className={`chat-last-message ${isOtherSender ? "message-unread" : ""}`}
          data-oid="s9epuw2"
        >
          {message.message}
        </div>
      </div>
      <div className="chat-time" data-oid=".k77v9i">
        <div className="chat-day" data-oid="0e:3e-s">
          {formattedTime.day}
        </div>
        <div className="chat-time-value" data-oid="5zuc65r">
          {formattedTime.time}
        </div>
      </div>
    </div>
  );
};

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchChats = async () => {
    try {
      console.log("try");
      const response = await fetch(`${SERVER_URL}/chats`, {
        credentials: "include",
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      console.log("fetch done");

      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.status}`);
      }

      const data = await response.json();

      // Sort chats by timestamp, most recent first
      const sortedChats = [...data].sort((a, b) => {
        const timestampA = new Date(a.message.timestamp).getTime();
        const timestampB = new Date(b.message.timestamp).getTime();
        return timestampB - timestampA; // Descending order (newest first)
      });

      setChats(sortedChats);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching chats:", err);

      // Check if it's the specific JSON parsing error that indicates empty response
      if (
        err.message === "Unexpected end of JSON input" ||
        err.message.includes(
          "Failed to execute 'json' on 'Response': Unexpected end of JSON input",
        )
      ) {
        // Handle empty response case - set chats to empty array
        setChats([]);
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleChatClick = (chatId) => {
    console.log(`Clicked on chat with ID: ${chatId}`);
    navigate(`/chats/${chatId}`);
  };
  useEffect(() => {
    // Request notification permission when the chats list is opened
    requestFirebaseNotificationPermission()
      .then((permission) => {
        console.log(
          "Chats: Firebase notification permission status:",
          permission,
        );
      })
      .catch((err) => {
        console.error("Chats: Error requesting notification permission:", err);
      });

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="chats-loading" data-oid="hgvalp7">
        Loading chats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="chats-error" data-oid="8p.47n0">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="main-chat-container" data-oid="s0jpysu">
      <h1 className="global-title" data-oid="o.xuulj">
        Your Conversations
      </h1>
      <div className="chats-container" data-oid="5ropkcd">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ChatRow
              key={chat.id}
              chat={chat}
              onClick={handleChatClick}
              data-oid="qah2ujd"
            />
          ))
        ) : (
          <div className="no-chats-message" data-oid="tojbw8c">
            No conversations yet. Start chatting with tutors or students!
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
