import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CodeEditor from "../components/Editor/CodeEditor";
import Chat from "../components/Editor/Chat";

const Document = ({ user }) => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collabInput, setCollabInput] = useState("");
  const [collabError, setCollabError] = useState("");
  const [collabSuccess, setCollabSuccess] = useState("");

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/code/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocument(res.data);
      } catch (err) {
        setError("Failed to fetch document");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  // Add collaborator
  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    setCollabError("");
    setCollabSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/code/${id}/collaborators/add`,
        { identifier: collabInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCollabSuccess("Collaborator added!");
      setCollabInput("");
      // Refresh document
      const res = await axios.get(`http://localhost:5000/api/code/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocument(res.data);
    } catch (err) {
      setCollabError(
        err.response?.data?.message || "Failed to add collaborator"
      );
    }
  };

  // Remove collaborator
  const handleRemoveCollaborator = async (identifier) => {
    setCollabError("");
    setCollabSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/code/${id}/collaborators/remove`,
        { identifier },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCollabSuccess("Collaborator removed!");
      // Refresh document
      const res = await axios.get(`http://localhost:5000/api/code/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocument(res.data);
    } catch (err) {
      setCollabError(
        err.response?.data?.message || "Failed to remove collaborator"
      );
    }
  };

  if (loading) return <div>Loading document...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!document) return <div>Document not found.</div>;

  // Determine if current user is owner
  const isOwner = document.createdBy && (document.createdBy._id === user.id || document.createdBy === user.id);

  return (
    <div>
      <h2>{document.title || "Untitled"}</h2>
      <p>Language: {document.language}</p>
      {/* Collaborators Section */}
      <div style={{ marginBottom: 24, border: "1px solid #eee", padding: 12 }}>
        <h3>Collaborators</h3>
        {document.collaborators && document.collaborators.length > 0 ? (
          <ul>
            {document.collaborators.map((collabId) => (
              <li key={collabId}>
                Collaborator ID: {collabId}
                {isOwner && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => handleRemoveCollaborator(collabId)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No collaborators yet.</p>
        )}
        {isOwner && (
          <form onSubmit={handleAddCollaborator} style={{ marginTop: 12 }}>
            <input
              type="text"
              placeholder="Username or Email"
              value={collabInput}
              onChange={(e) => setCollabInput(e.target.value)}
              required
            />
            <button type="submit" style={{ marginLeft: 8 }}>
              Add Collaborator
            </button>
          </form>
        )}
        {collabError && <p style={{ color: "red" }}>{collabError}</p>}
        {collabSuccess && <p style={{ color: "green" }}>{collabSuccess}</p>}
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 2 }}>
          <CodeEditor document={document} user={user} />
        </div>
        <div style={{ flex: 1 }}>
          <Chat documentId={document._id} user={user} />
        </div>
      </div>
    </div>
  );
};

export default Document;
