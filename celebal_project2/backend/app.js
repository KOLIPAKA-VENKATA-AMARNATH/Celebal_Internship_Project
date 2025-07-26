const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const codeRoutes = require("./routes/code");
app.use("/api/code", codeRoutes);

const chatRoutes = require("./routes/chat");
app.use("/api/chat", chatRoutes);

// Example route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// TODO: Add your routes here (auth, code, chat, etc.)

module.exports = app;
