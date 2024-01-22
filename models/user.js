const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  userName: { type: String, required: true },
  commission: { type: Number, default: 0, required: true },
  openingBalance: { type: Number, default: 0, required: true },
  creditReference: { type: Number, default: 0, required: true },
  mobile: { type: Number, required: true },
  exposureLimit: { type: Number, default: 0, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roles",
    required: true,
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Domain",
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "active",
    enum: ["active", "suspend", "locked"],
  },
});

const User = mongoose.model("User", userSchema);

(async () => {
  try {
    await User.createIndexes();
    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = User;
