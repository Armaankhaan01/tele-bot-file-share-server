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
    const words = searchText
      .replace(/\./g, "")
      .split(/\s+/)
      .filter((word) => isNaN(word));
      
    const regexes = words.map((word) => ({
      "metadata.name": { $regex: new RegExp(word, "i") },
    }));

    // Find files that match any words and sort alphabetically
    const files = await File.find({
      $or: regexes,
    })
      .sort({ "metadata.name": 1 })
      .lean();

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
