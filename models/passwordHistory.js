const mongoose = require("mongoose")

const passwordHistorySchema = new mongoose.Schema({
    updatedOf: {type: mongoose.Schema.Types.ObjectId, ref: "user",required:true},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: "user",required:true},
    createdAT: {type: Date, default: Date.now}
})

let passwordHistorySchemaModel = mongoose.model("passwordhistory", passwordHistorySchema)

(async () => {
    try {
      await passwordHistorySchemaModel.createIndexes();
      console.log("Indexes created successfully");
    } catch (error) {
      console.error("Error creating indexes:", error.message);
    }
  })();

module.exports = passwordHistorySchemaModel