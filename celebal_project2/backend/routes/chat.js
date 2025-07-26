const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Get chat history for a document
router.get("/:documentId", async (req, res) => {
  try {
    const messages = await Message.find({ documentId: req.params.documentId })
      .populate("user", "username email")
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
