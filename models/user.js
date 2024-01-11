const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  //   role: { type: String, required: true },
  //   domain: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Domain",
  //   },
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
