const mongoose = require("mongoose");
const { dbUri } = require("../config/env");

mongoose.connect(dbUri);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("MongoDB Connected");
});

module.exports = mongoose;
