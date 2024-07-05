const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: String,
  path: String,
  upload_status: String,
  metadata: {
    name: String,
    sizeMB: String,
    created: Date,
    isDirectory: Boolean,
    fileType: String,
  },
  chat_id: Number,
  message_id: Number,
  forwardedTo: [String],
  forward_status: String,
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
