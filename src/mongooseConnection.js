const mongoose = require("mongoose");

const { MONGO_URI } = process.env;
exports.connect = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(MONGO_URI)
    .then((connection) => {
      console.log("Successfully connected to database");
      return connection;
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};