const User = require("../../DB/models/User");
const File = require("../../DB/models/File");
const Message = require("../../DB/models/Message");
const { forwardMessage } = require("./telegram-handler");

const saveUser = async (messageObj) => {
  const userObj = {
    id: messageObj.from.id,
    first_name: messageObj.from.first_name,
    last_name: messageObj.from.last_name,
    username: messageObj.from.username,
    type: messageObj.chat.type,
    date: new Date(messageObj.date * 1000),
  };
  const user = new User(userObj);
  await user.save();
  return;
};

const checkUser = async (messageObj) => {
  const user = await User.findOne({ id: messageObj?.from?.id });
  if (!user) {
    saveUser(messageObj);
  }
  return;
};

const saveMessageToDB = async (messageObj) => {
  const message = new Message({
    messageId: messageObj.message_id,
    chatId: messageObj.chat.id,
    userId: messageObj.from.id,
    text: messageObj.text || "",
    date: new Date(messageObj.date * 1000), // Convert Unix timestamp to JavaScript Date
  });
  try {
    await message.save();
  } catch (error) {
    console.error("Error saving message to DB:", error);
  }

  return;
};

const searchForFiles = async (searchText) => {
  try {
    const regex = new RegExp(searchText, "i"); // "i" for case-insensitive
    const files = await File.find({
      "metadata.name": { $regex: regex },
    })
      .sort({ "metadata.name": 1 })
      .lean(); // Sort alphabetically by metadata.name

    return files;
  } catch (error) {
    console.error("Error searching for files:", error);
    return [];
  }
};

module.exports = {
  saveUser,
  saveMessageToDB,
  checkUser,
  searchForFiles,
};
