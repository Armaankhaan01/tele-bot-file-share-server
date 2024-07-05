const { axiosInstance } = require("./axios");
const { searchForFiles } = require("./db-handler");
const {
  sendMessage,
  sendFilesMessage,
  forwardDocumentToSingleChat,
} = require("./telegram-handler");

const handleMessage = async (messageObj) => {
  const messageText = messageObj.text || "";
  const chatId = messageObj.chat.id;

  if (messageText.charAt(0) === "/") {
    const command = messageText.substr(1);
    if (command === "start") {
      await sendMessage(
        chatId,
        "Hi, I'm a file sender bot. If a file available, It will be sent to you."
      );
    } else {
      await sendMessage(chatId, "I Don't understand. Please send a file Name.");
    }
    return;
  } else {
    if (/^\d+$/.test(messageText)) {
      // User has sent a number, assume it's for file selection
      const fileIndex = parseInt(messageText, 10) - 1;
      if (
        global.userFileSelections &&
        global.userFileSelections[chatId] &&
        global.userFileSelections[chatId][fileIndex]
      ) {
        const selectedFile = global.userFileSelections[chatId][fileIndex];
        const { message_id, chat_id } = selectedFile;
        try {
          await forwardDocumentToSingleChat(chatId, chat_id, message_id);
        } catch (error) {
          await sendMessage(chatId, `Failed to send file ${selectedFile.name}`);
        }
      } else {
        await sendMessage(chatId, "Invalid Selection. Please try again.");
      }
    } else {
      const files = await searchForFiles(messageText);
      if (files.length > 0) {
        sendFilesMessage(chatId, "", files);

        // Store the found files in a temporary storage to keep track of user's selection
        global.userFileSelections = global.userFileSelections || {};
        global.userFileSelections[chatId] = files;
      } else {
        await sendMessage(chatId, "No files found matching your query.");
      }
    }
  }
};

const handleCallbackQuery = async (callbackQuery) => {
  const { data, message } = callbackQuery;
  const chatId = message.chat.id;
  const messageId = message.message_id;
  if (data.startsWith("file_")) {
    const fileIndex = parseInt(data.split("_")[1], 10) - 1;
    if (
      global.userFileSelections &&
      global.userFileSelections[chatId] &&
      global.userFileSelections[chatId][fileIndex]
    ) {
      const selectedFile = global.userFileSelections[chatId][fileIndex];
      const { message_id, chat_id } = selectedFile;
      try {
        await forwardDocumentToSingleChat(chatId, chat_id, message_id);
        // await sendMessage(
        //   chatId,
        //   `File "${selectedFile.name}" sent successfully.`
        // );
      } catch (error) {
        await sendMessage(
          chatId,
          `Failed to send file "${selectedFile.name}".`
        );
      }
    } else {
      await sendMessage(chatId, "Invalid selection. Please try again.");
    }
  } else if (data.startsWith("prev_")) {
    const page = parseInt(data.split("_")[1], 10);
    sendFilesMessage(
      chatId,
      messageId,
      global.userFileSelections[chatId],
      page
    );
  } else if (data.startsWith("next_")) {
    const page = parseInt(data.split("_")[1], 10);
    sendFilesMessage(
      chatId,
      messageId,
      global.userFileSelections[chatId],
      page
    );
  }

  // Answer the callback query
  await axiosInstance.post("answerCallbackQuery", {
    callback_query_id: callbackQuery.id,
  });
};

module.exports = { handleMessage, handleCallbackQuery };
