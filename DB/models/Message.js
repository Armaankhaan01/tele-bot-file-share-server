const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  messageId: { type: Number, required: true },
  chatId: { type: Number, required: true },
  userId: { type: Number, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
