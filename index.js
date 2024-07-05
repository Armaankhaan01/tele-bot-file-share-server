const express = require("express");
const cors = require("cors");
const { PORT } = require("./config/env");
const { handler } = require("./controller");
const { handleCallbackQuery } = require("./controller/lib/Telegram");

// Initialize the Express app
const app = express();

// Connect to the Database
require("./DB/db");
// Use CORS middleware
app.use(cors());
// Use JSON parser middleware
app.use(express.json());

// Define the webhook endpoint to handle messages and callback queries
app.post("*", async (req, res) => {
  const { message, callback_query } = req.body;
  console.log(req.body);

  try {
    if (message) {
      res.send(await handler(message));
    } else if (callback_query) {
      res.send(await handleCallbackQuery(callback_query));
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.sendStatus(500); // Internal Server Error
  }
});

// Define a catch-all endpoint for GET requests
app.get("*", async (req, res) => {
  console.log(req.body);

  try {
    const response = await handler(req?.body?.message);
    res.send(response);
  } catch (error) {
    console.error("Error handling GET request:", error);
    res.sendStatus(500); // Internal Server Error
  }
});

// Start the server
app.listen(PORT, (err) => {
  if (err) {
    console.log("Error starting server:", err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});
