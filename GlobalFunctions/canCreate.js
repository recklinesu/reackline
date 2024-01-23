const mongoose = require("mongoose")
const UserDetails = require("../GlobalFunctions/userDetails")
const Roles = require("../models/roles")

const canCreate = async (userId, roleId) =>{
    try {
        
        const user = await UserDetails(userId)
        const role = await Roles.findById(new mongoose.Types.ObjectId(roleId))

        if(!user || !role){
            return false
        }

        const userPermissions = user.rolePermissions[0]

        checkPoint = null

        const UserPermissionsName = role.name
        
        if(UserPermissionsName === "Watcher"){
            checkPoint = "canWatcher"
        }else if(UserPermissionsName === "Declare"){
            checkPoint = "canDeclare"
        }else if(UserPermissionsName === "Creater"){
            checkPoint = "canCreater"
        }else if(UserPermissionsName === "WhiteLabel"){
            checkPoint = "canWhiteLabel"
        }else if(UserPermissionsName === "Super"){
            checkPoint = "canSuper"
        }else if(UserPermissionsName === "Master"){
            checkPoint = "canMaster"
        }else if(UserPermissionsName === "Agent"){
            checkPoint = "canAgent"
        }else if(UserPermissionsName === "User"){
            checkPoint = "canUser"
        }else{
            checkPoint = null
        }
        
        if(!checkPoint){
            return false
        }

        return userPermissions[checkPoint]

    } catch (error) {
        return false
    }
}

module.exports = canCreate