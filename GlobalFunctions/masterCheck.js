const mongoose = require("mongoose")
const User = require("../models/user")
const bcrypt = require("bcryptjs");

const masterCheck = async (userId, password)=>{
    try {
        const user = await User.findById(new mongoose.Types.ObjectId(userId));
        if(!user){
            return false
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if(isMatched){
            return true
        }

        return false
    } catch (error) {
        return false
    }
}

module.exports = masterCheck