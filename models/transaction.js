const mongoose = require("mongoose");
require("dotenv").config();

const transitSchema = new mongoose.Schema({
  payee: {type: mongoose.Schema.Types.ObjectId, ref: "User",required:true},
  payer: {type: mongoose.Schema.Types.ObjectId, ref: "User",required:true},
  amount: { type: Number, default: 0, required: true },
  remark: { type: String, required: false },
  message: { type: String, required: false },
  status: {
    type: String,
    required: true,
    default: "failed",
    enum: ["success", "failed"],
  },
  openingBalancePayee:{ type: Number, default: 0, required: false },
  openingBalancePayer:{ type: Number, default: 0, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Transit = mongoose.model("transaction", transitSchema);

(async () => {
  try {
    await Transit.createIndexes();
    console.log("Transactions created successfully \n ======================================>");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = Transit;
