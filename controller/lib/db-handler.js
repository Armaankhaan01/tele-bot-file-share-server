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
    // Split search text into words, remove non-alphabetic characters, and filter out numbers
    const words = searchText
      .replace(/\W+/g, " ")
      .split(" ")
      .filter((word) => isNaN(word) && word);

    // Construct an array of individual regex expressions for each word
    const regexes = words.map((word) => new RegExp(word, "i"));

    // Fetch all files that match at least one word
    const allFiles = await File.find({
      $or: regexes.map((regex) => ({
        "metadata.name": { $regex: regex },
      })),
    }).lean();

    // Rank files based on the count of matching words in metadata.name
    const rankedFiles = allFiles
      .map((file) => {
        // Count number of matches for each word
        const matchCount = words.reduce((count, word) => {
          return file.metadata.name.match(new RegExp(word, "i"))
            ? count + 1
            : count;
        }, 0);
        return { ...file, relevance: matchCount };
      })
      .filter((file) => file.relevance > 0) // Only keep files with at least one match
      .sort((a, b) => b.relevance - a.relevance); // Sort by relevance (highest first)

    return rankedFiles;
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
