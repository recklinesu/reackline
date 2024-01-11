const mongoose = require("mongoose");
require("dotenv").config();

const domainSchema = new mongoose.Schema({
  title: { type: String, required: true },
  host: { type: String, required: true, unique: true },
  addedAt: { type: Date, default: Date.now },
  color: { type: String, default: process.env.DEFAULT_COLOR },
  logo: { type: String, default: process.env.DEFAULT_LOGO },
  favIcon: { type: String, default: process.env.DEFAULT_FAV_ICON },
});

const Domain = mongoose.model("Domain", domainSchema);

(async () => {
  try {
    await Domain.createIndexes();
    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = Domain;
