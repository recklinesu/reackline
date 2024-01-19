const mongoose = require("mongoose");
require("dotenv").config();

const roleSchema = new mongoose.Schema({
  role: { type: String, required: true },
  permissions: { type: String, required: false },
  createdAt: { type: Date, default: Date.now() },
});

const Role = mongoose.model("Role", roleSchema);

(async () => {
  try {
    await Role.createIndexes();
    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = Role;
