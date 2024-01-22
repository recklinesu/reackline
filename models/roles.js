const mongoose = require("mongoose")

const roleSchema = new mongoose.Schema({
    name:{type: String, required: true, unique: true},
    canWatcher:{type: Boolean, default: false},
    canDeclare:{type: Boolean, default: false},
    canCreater:{type: Boolean, default: false},
    canWhiteLabel:{type: Boolean, default: false},
    canSuper:{type: Boolean, default: false},
    canMaster:{type: Boolean, default: false},
    canAgent:{type: Boolean, default: false},
    canUser:{type: Boolean, default: false},
})

let roleSchemaModel = mongoose.model("roles", roleSchema);

(async () => {
    try {
      await roleSchemaModel.createIndexes();
      console.log("Indexes created successfully");
    } catch (error) {
      console.error("Error creating indexes:", error.message);
    }
  })();

module.exports = roleSchemaModel