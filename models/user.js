const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, default: "Anonymous", required:false },
  userName: { type: String, required: true },
  commission: { type: Number, default: 0, required: false },
  openingBalance: { type: Number, default: 0, required: false },
  creditReference: { type: Number, default: 0, required: false },
  partnership: { type: Number, default: 0, required: false },
  currency: { type: String, default: "INR", required: false },
  mobile: { type: Number, mobile: null,required: false },
  exposureLimit: { type: Number, default: 0, required: false },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Domain",
    required: true,
  },
  status: {
    type: String,
    required: false,
    default: "active",
    enum: ["active", "suspend", "locked"],
  },
});

const User = mongoose.model("User", userSchema);

(async () => {
  try {
    await User.createIndexes();
    console.log(
      "Users created successfully \n ======================================>"
    );
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = User;
