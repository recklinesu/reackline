  const mongoose = require("mongoose");
  require("dotenv").config();

  const domainSchema = new mongoose.Schema({
    eventId: { type: String, required: true },
    legueId: { type: String, required: true },
    matchId: { type: String, required: true },
    marketId: { type: String, required: true },
    sportsName: { type: String, required: true },
    event: { type: String, required: true },
    markettype: { type: String, required: true },
    selection: { type: String, required: true },
    selectionId: { type: String, required: true },
    type: { type: String, required: true },
    oddsReq: { type: String, required: true },
    stake: { type: Number, required: true },
    placeTime: { type: String, required: true },
    favourMargin: { type: Number, required: true },
    againstMargin: { type: Number, required: true },
    runnersCount: { type: Number, required: true },
    runners: {
      type: Array,
      required: true
    },
    status: {
      type: String,
      required: true,
      default: "hold",
      enum: ["hold", "complete"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  });

  const OddsBet = mongoose.model("oddsBet", domainSchema);

  (async () => {
    try {
      await OddsBet.createIndexes();
      console.log("OddsBet created successfully \n ======================================>");
    } catch (error) {
      console.error("Error creating indexes:", error.message);
    }
  })();

  module.exports = OddsBet;
