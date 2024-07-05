require("dotenv").config();
const dbUri = process.env.MONGODB_URI;
const MY_TOKEN = process.env.MY_TOKEN;
const PORT = process.env.PORT || 4000;
module.exports = { dbUri, MY_TOKEN, PORT };
