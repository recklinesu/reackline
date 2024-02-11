const mongoose = require("mongoose");
require("dotenv").config();

const domainSchema = new mongoose.Schema({
  title: { type: String, required: true },
  host: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  primaryColor: { type: String, default: process.env.DEFAULT_COLOR },
  secondaryColor: { type: String, default: process.env.DEFAULT_COLOR },
  backgroundColor: { type: String, default: process.env.DEFAULT_COLOR },
  logoUrl: { type: String, default: process.env.DEFAULT_LOGO },
  favIconUrl: { type: String, default: process.env.DEFAULT_FAV_ICON },
  status: {
    type: String,
    required: true,
    default: "active",
    enum: ["active", "suspend"],
  },
});

const Domain = mongoose.model("Domain", domainSchema);

(async () => {
  try {
    await Domain.createIndexes();
    console.log("Site created successfully \n ======================================>");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = Domain;
