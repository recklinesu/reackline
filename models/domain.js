const mongoose = require("mongoose");
require("dotenv").config();

const domainSchema = new mongoose.Schema({
  title: { type: String, required: true },
  host: { type: String, required: true, unique: true },
  addedAt: { type: Date, default: Date.now },
  primaryColor: { type: String, default: process.env.DEFAULT_COLOR },
  secondaryColor: { type: String, default: process.env.DEFAULT_COLOR },
  backgroundColor: { type: String, default: process.env.DEFAULT_COLOR },
  logoUrl: { type: String, default: process.env.DEFAULT_LOGO },
  favIconUrl: { type: String, default: process.env.DEFAULT_FAV_ICON },
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
