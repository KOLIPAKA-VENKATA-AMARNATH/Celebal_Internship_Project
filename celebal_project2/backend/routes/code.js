const express = require("express");
const router = express.Router();
const codeController = require("../controllers/codeController");
const auth = require("../middleware/auth");
const crypto = require("crypto");

// Create a new document
router.post("/", auth, codeController.createDocument);

// Get a document by ID
router.get("/:id", auth, codeController.getDocument);

// Update a document (and save a new version)
router.put("/:id", auth, codeController.updateDocument);

// List all documents for a user
router.get("/", auth, codeController.listDocuments);

// Revert to a previous version
router.post("/:id/revert", auth, codeController.revertVersion);

// Generate a shareable link (token)
router.post("/:id/share", auth, async (req, res) => {
  try {
    const doc = await codeController.getDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Generate a unique token
    const token = crypto.randomBytes(16).toString("hex");
    doc.shareToken = token;
    await doc.save();
    res.json({ shareUrl: `/api/code/shared/${token}` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Remove share token (unshare)
router.post("/:id/unshare", auth, async (req, res) => {
  try {
    const doc = await codeController.getDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.shareToken = undefined;
    await doc.save();
    res.json({ message: "Sharing disabled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a collaborator
router.post("/:id/collaborators/add", auth, codeController.addCollaborator);
// Remove a collaborator
router.post("/:id/collaborators/remove", auth, codeController.removeCollaborator);

// Publicly fetch a shared document by token (no auth)
router.get("/shared/:token", async (req, res) => {
  try {
    const doc = await codeController.getDocumentByToken(req.params.token);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
