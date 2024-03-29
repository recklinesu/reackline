const mongoose = require("mongoose")
const UserDetails = require("../GlobalFunctions/userDetails")

const permissionCheck = async (admin,worker) =>{
    try {
        
        const adminData = await UserDetails(admin)
        const workerData = await UserDetails(worker)

        if(!adminData.role){
            return false
        }
        if(!workerData.role){
            return false
        }

        const adminPermissions = adminData.role
        const workerPermissionsName = workerData.role.name

        checkPoint = null
        
        if(workerPermissionsName === "Watcher"){
            checkPoint = "canWatcher"
        }else if(workerPermissionsName === "Declare"){
            checkPoint = "canDeclare"
        }else if(workerPermissionsName === "Creater"){
            checkPoint = "canCreater"
        }else if(workerPermissionsName === "WhiteLabel"){
            checkPoint = "canWhiteLabel"
        }else if(workerPermissionsName === "Super"){
            checkPoint = "canSuper"
        }else if(workerPermissionsName === "Master"){
            checkPoint = "canMaster"
        }else if(workerPermissionsName === "Agent"){
            checkPoint = "canAgent"
        }else if(workerPermissionsName === "User"){
            checkPoint = "canUser"
        }else{
            checkPoint = null
        }

        if(!checkPoint){
            return false
        }

        return adminPermissions[checkPoint]

    } catch (error) {
        return false
    }
}

module.exports = permissionCheck