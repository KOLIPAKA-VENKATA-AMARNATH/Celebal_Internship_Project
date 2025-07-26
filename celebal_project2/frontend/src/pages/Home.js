import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/code", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocuments(res.data);
      } catch (err) {
        console.error("Fetch documents error:", err);
        setError("Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/code",
        {
          title,
          content: "",
          language,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocuments((docs) => [...docs, res.data]);
      setTitle("");
      setLanguage("javascript");
      navigate(`/document/${res.data._id}`);
    } catch (err) {
      console.error("Create document error:", err);
      setError("Failed to create document");
    }
  };

  return (
    <div>
      <h2>Home</h2>
      <p>Welcome, {user.username}! (You are logged in.)</p>
      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c++">C++</option>
          <option value="c#">C#</option>
        </select>
        <button type="submit">Create Document</button>
      </form>
      {loading && <p>Loading documents...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {documents.map((doc) => {
          const isOwner = doc.createdBy && (doc.createdBy._id === user.id || doc.createdBy === user.id);
          return (
            <li key={doc._id}>
              <button 
                onClick={() => navigate(`/document/${doc._id}`)}
                style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {doc.title || "Untitled"}
              </button> ({doc.language})
              <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#666' }}>
                {isOwner ? (
                  <span style={{ color: 'green' }}>• Owner</span>
                ) : (
                  <span style={{ color: 'orange' }}>• Collaborator (Owner: {doc.createdBy?.username || 'Unknown'})</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Home;
