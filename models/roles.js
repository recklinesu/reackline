const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  canWatcher: { type: Boolean, default: false },
  canDeclare: { type: Boolean, default: false },
  canCreater: { type: Boolean, default: false },
  canWhiteLabel: { type: Boolean, default: false },
  canSuper: { type: Boolean, default: false },
  canMaster: { type: Boolean, default: false },
  canAgent: { type: Boolean, default: false },
  canUser: { type: Boolean, default: false },
});

let Role = mongoose.model("Role", roleSchema);

(async () => {
  try {

    try {
      await Role.create({
        name:"Watcher",
        canWatcher:false,
        canDeclare:false,
        canCreater:false,
        canWhiteLabel:false,
        canSuper:false,
        canMaster:false,
        canAgent:false,
        canUser:false,
    })
    await Role.create({
        name:"Declare",
        canWatcher:false,
        canDeclare:false,
        canCreater:false,
        canWhiteLabel:false,
        canSuper:false,
        canMaster:false,
        canAgent:false,
        canUser:false,
    })
    await Role.create({
        name:"Creater",
        canWatcher:false,
        canDeclare:false,
        canCreater:false,
        canWhiteLabel:false,
        canSuper:false,
        canMaster:false,
        canAgent:false,
        canUser:false,
    })
    await Role.create({
        name:"WhiteLabel",
        canWatcher:false,
        canDeclare:false,
        canCreater:false,
        canWhiteLabel:false,
        canSuper:false,
        canMaster:false,
        canAgent:false,
        canUser:false,
    })
    await Role.create({
        name:"Super",
        canWatcher:false,
        canDeclare:false,
        canCreater:false,
        canWhiteLabel:false,
        canSuper:false,
        canMaster:false,
        canAgent:false,
        canUser:false,
    })
    await Role.create({
        name:"Master",
        canWatcher:false,
        canDeclare:false,
        canCreater:false,
        canWhiteLabel:false,
        canSuper:false,
        canMaster:false,
        canAgent:false,
        canUser:false,
    })
    await Role.create({
        name:"Agent",
        canWatcher:false,
        canDeclare:false,
        canCreater:false,
        canWhiteLabel:false,
        canSuper:false,
        canMaster:false,
        canAgent:false,
        canUser:false,
    })
    await Role.create({
        name:"User",
        canWatcher:false,
        canDeclare:false,
        canCreater:false,
        canWhiteLabel:false,
        canSuper:false,
        canMaster:false,
        canAgent:false,
        canUser:false,
    })
    } catch (error) {
      
    }
    await Role.createIndexes();
    console.log(
      "Roles created successfully \n ======================================>"
    );
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
})();

module.exports = Role;
