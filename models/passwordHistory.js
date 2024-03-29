const mongoose = require("mongoose")

const passwordHistorySchema = new mongoose.Schema({
    updatedOf: {type: mongoose.Schema.Types.ObjectId, ref: "User",required:true},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User",required:true},
    createdAT: {type: Date, default: Date.now}
})

let passwordHistorySchemaModel = mongoose.model("passwordhistory", passwordHistorySchema);

(async () => {
    try {
      await passwordHistorySchemaModel.createIndexes();
      console.log("Password history created successfully \n ======================================>");
    } catch (error) {
      console.error("Error creating indexes:", error.message);
    }
  })();

module.exports = passwordHistorySchemaModel