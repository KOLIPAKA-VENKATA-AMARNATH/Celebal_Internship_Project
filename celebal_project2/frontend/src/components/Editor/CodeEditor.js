import React, { useEffect, useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

const CodeEditor = ({ document, user }) => {
  const [code, setCode] = useState(document.content || "");
  const [language, setLanguage] = useState(document.language || "javascript");
  const [saveStatus, setSaveStatus] = useState("");
  const socketRef = useRef(null);
  const preventEmit = useRef(false);

  useEffect(() => {
    setCode(document.content || "");
    setLanguage(document.language || "javascript");
  }, [document]);

  useEffect(() => {
    // Connect to Socket.IO
    socketRef.current = io(SOCKET_URL);
    // Join the document room
    socketRef.current.emit("joinDocument", document._id);

    // Listen for code updates from others
    socketRef.current.on("codeUpdate", (newCode) => {
      preventEmit.current = true;
      setCode(newCode);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [document._id]);

  // Handle code change in editor
  const handleEditorChange = (value) => {
    setCode(value);
    if (preventEmit.current) {
      preventEmit.current = false;
      return;
    }
    // Emit code change to others
    socketRef.current.emit("codeChange", {
      documentId: document._id,
      content: value,
    });
  };

  // Save code to backend
  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/code/${document._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: code, language }),
        }
      );
      if (response.ok) {
        setSaveStatus("Saved!");
      } else {
        setSaveStatus("Error saving code");
      }
    } catch (err) {
      setSaveStatus("Error saving code");
    }
    setTimeout(() => setSaveStatus(""), 2000);
  };

  return (
    <div>
      <button onClick={handleSave} style={{ marginBottom: "10px" }}>
        Save
      </button>
      {saveStatus && <span style={{ marginLeft: "10px" }}>{saveStatus}</span>}
      <MonacoEditor
        height="400px"
        language={language}
        value={code}
        onChange={handleEditorChange}
        options={{ fontSize: 16, minimap: { enabled: false } }}
      />
    </div>
  );
};

export default CodeEditor;
