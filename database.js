const mongoose = require("mongoose");
require("dotenv").config();

const connectToMongo = async () => {
  try {
    const mongooseOptions = {};

    await mongoose.connect(process.env.APP_DATABASE_URL, mongooseOptions);

    const database = mongoose.connection;

    database.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    database.once("connected", () => {
      console.log("Database connected successfully!");
    });

    database.once("disconnected", () => {
      console.log("Database disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectToMongo;
