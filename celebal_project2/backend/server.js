const http = require("http");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const app = require("./app");
require("dotenv").config();
const Message = require("./models/Message");

const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Socket.IO logic placeholder
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a document room
  socket.on("joinDocument", (documentId) => {
    socket.join(documentId);
    console.log(`User ${socket.id} joined document ${documentId}`);
  });

  // Handle code changes
  socket.on("codeChange", ({ documentId, content }) => {
    // Broadcast to others in the room
    socket.to(documentId).emit("codeUpdate", content);
  });

  // Handle chat messages
  socket.on("chatMessage", async ({ documentId, message, user }) => {
    // Save to DB
    await Message.create({
      documentId,
      user,
      message,
    });
    // Broadcast to room
    io.to(documentId).emit("chatMessage", { message, user });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

module.exports = { io };
