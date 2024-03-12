const mongoose = require("mongoose");
require("dotenv").config();

const domainSchema = new mongoose.Schema({
  notice: { type: String, required: true },
  domain: {type: mongoose.Schema.Types.ObjectId, ref: "Domain",required:true},
  createdAT: {type: Date, default: Date.now}
});

const Notice = mongoose.model("Notice", domainSchema);

(async () => {
  try {
    await Notice.createIndexes();
    console.log("Notice created successfully \n ======================================>");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = Notice;
