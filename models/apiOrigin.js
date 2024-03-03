const mongoose = require("mongoose");
require("dotenv").config();

const apiOriginSchema = new mongoose.Schema({
api: { type: String, required: true, unique: true },
  api1: {type: String, required:true, unique: true},
  api2: {type: String, required:true, unique: true},
  createdAt: { type: Date, default: Date.now },
});

const ApiOrigins = mongoose.model("ApiOrigins", apiOriginSchema);

(async () => {
  try {
    await ApiOrigins.createIndexes();
    console.log("Partnership transactions created successfully \n ======================================>");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = ApiOrigins;
