const mongoose = require("mongoose");
require("dotenv").config();

const transitSchema = new mongoose.Schema({
  from: {type: mongoose.Schema.Types.ObjectId, ref: "User",required:true},
  of: {type: mongoose.Schema.Types.ObjectId, ref: "User",required:true},
  oldPartnership: { type: Number, default: 0, required: true },
  newPartnership: { type: Number, default: 0,required: true },
  createdAt: { type: Date, default: Date.now },
});

const Transit = mongoose.model("partnerTransaction", transitSchema);

(async () => {
  try {
    await Transit.createIndexes();
    console.log("Partnership transactions created successfully \n ======================================>");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = Transit;
