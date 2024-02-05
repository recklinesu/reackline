const express = require("express")
const mongoose = require("mongoose")
const UserDetails = require("../GlobalFunctions/userDetails")

const routePermissions = async (userId,allowedRolesList) => {
    try {
        if(!allowedRolesList){
            return false
        }
    
        let user = await UserDetails(userId)
    
        if(!user){
            return false
        }
        
        const userPermission = user.role[0].name

        if(allowedRolesList.includes(userPermission)){
            return true
        }

        return false
    } catch (error) {
        return false
    }

}

module.exports = routePermissions