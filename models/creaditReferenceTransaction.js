const mongoose = require("mongoose");
require("dotenv").config();

const transitSchema = new mongoose.Schema({
  from: {type: mongoose.Schema.Types.ObjectId, ref: "User",required:true},
  of: {type: mongoose.Schema.Types.ObjectId, ref: "User",required:true},
  oldCredit: { type: Number, default: 0, required: true },
  newCredit: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Transit = mongoose.model("creditTransaction", transitSchema);

(async () => {
  try {
    await Transit.createIndexes();
    console.log("Creadit reference transactions created successfully \n ======================================>");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = Transit;
