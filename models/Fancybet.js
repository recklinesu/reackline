const mongoose = require("mongoose");
require("dotenv").config();

const domainSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  legueId: { type: String, required: true },
  matchId: { type: String, required: true },
  sportsName: { type: String, required: true },
  event: { type: String, required: true },
  markettype: { type: String, required: true },
  selection: { type: String, required: true },
  selectionId: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  price: { type: Number, required: true },
  stake: { type: Number, required: true },
  placeTime: { type: String, required: true },
  favourMargin: { type: Number, required: true },
  againstMargin: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    default: "unsetteled",
    enum: ["setteled", "unsetteled"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const FancyBet = mongoose.model("fancyBet", domainSchema);

(async () => {
  try {
    await FancyBet.createIndexes();
    console.log("FancyBet created successfully \n ======================================>");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = FancyBet;
