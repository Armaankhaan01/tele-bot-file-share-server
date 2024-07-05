const File = require("../../DB/models/File");
const { axiosInstance } = require("./axios");

const sendMessage = (chatId, messageText) => {
  const MAX_MESSAGE_LENGTH = 4096; // Telegram's Max message Length
  const message = [];
  while (messageText.length > MAX_MESSAGE_LENGTH) {
    message.push(messageText.slice(0, MAX_MESSAGE_LENGTH));
    messageText = messageText.slice(MAX_MESSAGE_LENGTH);
  }
  message.push(messageText);

  return Promise.all(
    message.map((message) =>
      axiosInstance.post("sendMessage", {
        chat_id: chatId,
        text: message,
      })
    )
  );
};

async function forwardMessage(chatId, fromChatId, messageId) {
  try {
    const response = await axiosInstance.post("forwardMessage", {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId,
    });
    return response.data;
  } catch (error) {
    console.error("Error forwarding message:", error);
    throw error;
  }
}

const sendFilesMessage = async (chatId, messageId, files, page = 1) => {
  const pageSize = 10;
  const totalPages = Math.ceil(files.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const filesPage = files.slice(start, end);

  const inlineKeyboard = filesPage.map((file, index) => [
    {
      text: `${index + 1}. ${file.name}`,
      callback_data: `file_${start + index + 1}`,
    },
  ]);

  const paginationButtons = [];
  if (page > 1) {
    paginationButtons.push({
      text: "Previous",
      callback_data: `prev_${page - 1}`,
    });
  }
  if (page < totalPages) {
    paginationButtons.push({
      text: "Next",
      callback_data: `next_${page + 1}`,
    });
  }
  if (messageId) {
    await axiosInstance.post("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: `Found the following files (Page ${page} of ${totalPages}):`,
      reply_markup: {
        inline_keyboard: [...inlineKeyboard, paginationButtons],
      },
    });
  } else {
    await axiosInstance.post("sendMessage", {
      chat_id: chatId,
      text: `Found the following files (Page ${page} of ${totalPages}):`,
      reply_markup: {
        inline_keyboard: [...inlineKeyboard, paginationButtons],
      },
    });
  }
};

const forwardDocumentToSingleChat = async (chatId, sourceChatId, messageId) => {
  try {
    await forwardMessage(chatId, sourceChatId, messageId);
    await File.updateOne(
      { message_id: messageId },
      { $addToSet: { forwardedTo: chatId } }
    );
  } catch (err) {
    console.error(err);
  }
};
module.exports = {
  sendFilesMessage,
  sendMessage,
  forwardMessage,
  forwardDocumentToSingleChat,
};
