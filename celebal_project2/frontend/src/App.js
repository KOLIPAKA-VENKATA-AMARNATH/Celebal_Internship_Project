import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Home from "./pages/Home";
import Document from "./pages/Document";

function App() {
  const [user, setUser] = useState(() => {
    // Try to get user from localStorage (optional, for persistence)
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <div>
        <nav>
          {user ? (
            <>
              <span>Welcome, {user.username}!</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <a href="/login">Login</a> | <a href="/signup">Signup</a>
            </>
          )}
        </nav>
        <Routes>
          <Route
            path="/"
            element={user ? <Home user={user} /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/document/:id"
            element={user ? <Document user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
