const mongoose = require("mongoose");
require("dotenv").config();

const domainSchema = new mongoose.Schema({
  title: { type: String, required: true },
  host: { type: String, required: true, unique: true },
  addedAt: { type: Date, default: Date.now },
  primaryColor: { type: String, required: true },
  secondaryColor: { type: String, required: true },
  headerColor: { type: String, required: true },
  headerLoginButtonColor: { type: String, required: true },
  loginPageColor: { type: String, required: true },
  loginPageButtonColor: { type: String, required: true },
  backgroundColor: { type: String, required: true },
  logoUrl: { type: String, required: true },
  favIconUrl: { type: String, required: true },
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
