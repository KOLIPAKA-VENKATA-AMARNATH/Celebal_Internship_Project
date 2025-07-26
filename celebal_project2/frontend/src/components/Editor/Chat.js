import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "http://localhost:5000";

const Chat = ({ documentId, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/chat/${documentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(
          res.data.map((msg) => ({
            user: msg.user?.username || "Unknown",
            message: msg.message,
          }))
        );
      } catch (err) {
        setError("Failed to fetch chat history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [documentId]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("joinDocument", documentId);
    socketRef.current.on("chatMessage", ({ message, user }) => {
      setMessages((msgs) => [
        ...msgs,
        { message, user: user.username || user },
      ]);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [documentId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socketRef.current.emit("chatMessage", {
      documentId,
      message: input,
      user: { username: user.username },
    });
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 300 }}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: 8,
          border: "1px solid #eee",
          padding: 8,
        }}
      >
        {loading ? (
          <div>Loading chat...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx}>
              <strong>{msg.user}:</strong> {msg.message}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
