const CodeDocument = require("../models/CodeDocument");
const User = require("../models/User");

// Create a new code document
exports.createDocument = async (req, res) => {
  try {
    console.log('Received createDocument request with body:', req.body);
    const { title, content, language } = req.body;
    const doc = new CodeDocument({
      title,
      content,
      language,
      createdBy: req.user.id, // Use user ID from JWT token
      versions: [{ content, editedBy: req.user.id }],
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error("Create document error:", err);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get a code document by ID
exports.getDocument = async (req, res) => {
  try {
    const doc = await CodeDocument.findById(req.params.id).populate(
      "createdBy",
      "username email"
    );
    if (!doc) return res.status(404).json({ message: "Document not found" });
    // Access control: only owner or collaborators
    const userId = req.user.id;
    const isOwner = doc.createdBy._id.toString() === userId;
    const isCollaborator = doc.collaborators.map(id => id.toString()).includes(userId);
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Access denied: not a collaborator or owner" });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update a code document and save a new version
exports.updateDocument = async (req, res) => {
  try {
    const { content, editedBy } = req.body;
    const doc = await CodeDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    // Access control: only owner or collaborators
    const userId = req.user.id;
    const isOwner = doc.createdBy.toString() === userId;
    const isCollaborator = doc.collaborators.map(id => id.toString()).includes(userId);
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Access denied: not a collaborator or owner" });
    }
    doc.content = content;
    doc.versions.push({ content, editedBy });
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// List all documents for a user
exports.listDocuments = async (req, res) => {
  try {
    const docs = await CodeDocument.find({
      $or: [
        { createdBy: req.user.id },
        { collaborators: req.user.id }
      ]
    }).populate("createdBy", "username email");
    res.json(docs);
  } catch (err) {
    console.error("List documents error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Revert to a previous version
exports.revertVersion = async (req, res) => {
  try {
    const { versionIndex } = req.body;
    const doc = await CodeDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (versionIndex < 0 || versionIndex >= doc.versions.length) {
      return res.status(400).json({ message: "Invalid version index" });
    }

    doc.content = doc.versions[versionIndex].content;
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add a collaborator by username or email
exports.addCollaborator = async (req, res) => {
  try {
    const { identifier } = req.body; // username or email
    const doc = await CodeDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    // Only owner can add collaborators
    if (doc.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can add collaborators" });
    }
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (doc.collaborators.map(id => id.toString()).includes(user._id.toString())) {
      return res.status(400).json({ message: "User is already a collaborator" });
    }
    if (user._id.toString() === doc.createdBy.toString()) {
      return res.status(400).json({ message: "Owner is already a collaborator" });
    }
    doc.collaborators.push(user._id);
    await doc.save();
    res.json({ message: "Collaborator added", collaborators: doc.collaborators });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a collaborator by username or email
exports.removeCollaborator = async (req, res) => {
  try {
    const { identifier } = req.body; // username or email
    const doc = await CodeDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    // Only owner can remove collaborators
    if (doc.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can remove collaborators" });
    }
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) return res.status(404).json({ message: "User not found" });
    const before = doc.collaborators.length;
    doc.collaborators = doc.collaborators.filter(id => id.toString() !== user._id.toString());
    if (doc.collaborators.length === before) {
      return res.status(400).json({ message: "User is not a collaborator" });
    }
    await doc.save();
    res.json({ message: "Collaborator removed", collaborators: doc.collaborators });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Helper: Get document by ID (for sharing)
exports.getDocumentById = async (id) => {
  return await CodeDocument.findById(id);
};

// Helper: Get document by share token (for public access)
exports.getDocumentByToken = async (token) => {
  return await CodeDocument.findOne({ shareToken: token });
};
