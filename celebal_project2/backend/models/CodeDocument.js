const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
  content: String,
  timestamp: { type: Date, default: Date.now },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const codeDocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    language: { type: String, default: "plaintext" },
    versions: [versionSchema],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shareToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodeDocument", codeDocumentSchema);
