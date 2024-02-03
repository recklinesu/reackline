const mongoose = require("mongoose")
const Users = require("../models/user")

const userDetails = async (userId) =>{

    const userIdToObj = new mongoose.Types.ObjectId(userId)

    const user = await Users.aggregate([
        {
          $match: {
            _id: userIdToObj
          }
        },
        {
          $lookup:{
            from:"roles",
            localField: 'role',
            foreignField: '_id',
            as: "role",
          }
        },
      ])

      if(!user){
        return false;
      }

      return user[0]
}

module.exports = userDetails
