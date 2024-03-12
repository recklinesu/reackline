const mongoose = require("mongoose");
require("dotenv").config();

const domainSchema = new mongoose.Schema({
  banner: { type: String, required: true },
  domain: {type: mongoose.Schema.Types.ObjectId, ref: "Domain",required:true},
  createdAT: {type: Date, default: Date.now}
});

const Banner = mongoose.model("Banner", domainSchema);

(async () => {
  try {
    await Banner.createIndexes();
    console.log("Banner created successfully \n ======================================>");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = Banner;
