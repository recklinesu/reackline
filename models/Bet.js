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
    stake: { type: Number, required: true },
    placeTime: { type: String, required: true },
    favourMargin: { type: Number, required: true },
    againstMargin: { type: Number, required: true },
    marketId: { type: String, required: false },
    oddsReq: { type: Number, required: false },
    runnersCount: { type: Number, required: false },
    size: { type: Number, required: false },
    price: { type: Number, required: false },
    runners: {
      type: Array,
      required: false
    },
    status: {
      type: String,
      required: true,
      default: "unsettled",
      enum: ["settled", "unsettled","void"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    settledAt: { type: Date, required:false },
  });

  const BetModel = mongoose.model("Bet", domainSchema);

  (async () => {
    try {
      await BetModel.createIndexes();
      console.log("Bets created successfully \n ======================================>");
    } catch (error) {
      console.error("Error creating indexes:", error.message);
    }
  })();

  module.exports = BetModel;
