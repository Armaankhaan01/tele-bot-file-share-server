const { checkUser, saveMessageToDB } = require("./lib/db-handler");
const { handleMessage } = require("./lib/Telegram");

const handler = async (message) => {
  if (message) {
    await checkUser(message);
    await saveMessageToDB(message);
    await handleMessage(message);
  }
  return;
};

module.exports = { handler };
