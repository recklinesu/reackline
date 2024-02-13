const mongoose = require("mongoose")
const Users = require("../models/user")

const userDetails = async (userId) =>{

    const userIdToObj = new mongoose.Types.ObjectId(userId)

    const user = await Users.findById(userIdToObj).populate(['role','domain'])

      if(!user){
        return false;
      }

      return user
}

module.exports = userDetails
