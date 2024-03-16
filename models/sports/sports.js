const mongoose = require("mongoose");
require("dotenv").config();

const sportsSchema = new mongoose.Schema({
    event: { type: Array },
    legues: { type: Array },
    matches: { type: Array },
    markets: { type: Array },
    odds: { type: Array },
    createdAt: { type: Date, default: Date.now },
});

const Sports = mongoose.model("Sports", sportsSchema);

module.exports = Sports;
