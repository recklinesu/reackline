var aes256 = require('aes256')
var jwt = require('jsonwebtoken')
const express = require("express")
const Users = require('../models/user')
require("dotenv").config()


const jwtVerify = async (req, res, next) =>{

    try {
        const token = decryptData(req.headers['user-token'])

        if(!token) return res.status(401).send({auth: false, error: "Unauthorized", message: 'No token provided.'})

        const data = jwt.verify(token, process.env.JWT_KEY)

        const user_id = data.user_id

        const user = await Users.findById(user_id).select("-password")

        if(!user){
            return res.status(403).send({auth: false, error: "Unauthorized", message: 'Access token expired!'})
        }

        req.user = user

        next()
        
    } catch (error) {
        return res.status(403).send({auth: false, error: "Unauthorized", message: 'Invalid token!'})
    }
}


// Common function

const encryptData = (data) => {
    return aes256.encrypt(process.env.AES256_KEY, data)
}

const decryptData = (data) => {
    return aes256.decrypt(process.env.AES256_KEY, data)
}

module.exports = jwtVerify