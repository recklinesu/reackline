const express = require("express")
const routes = express.Router()
const bcrypt = require('bcryptjs')
const Users = require('../models/user')
const jwt = require('jsonwebtoken')
const { query, validationResult, body } = require('express-validator')
const aes256 = require('aes256')
const jwtVerify = require('../middleware/jwtAuth')
require("dotenv").config()

routes.post("/signup", [
    body("name").notEmpty().trim().withMessage("Name cannot be empty."),
    body("email").isEmail().trim().withMessage("Please provide a valid email address."),
    body("email").custom(async value=>{
        const existingUsers = await Users.findOne({email: value})
        if(existingUsers){
            throw new Error("This email address is already exists")
        }
    }),
    body("password").custom( (value) =>{
        if(!value){
            throw new Error("Password cannot be empty.")
        }else if(value.length < 6){
            throw new Error("The password must contain at least six characters.")
        } else return true;
    }),
    body("cpassword").custom( (value, data) =>{
        if(!value){
            throw new Error("Ccnfirm Password cannot be empty.")
        }else if(value !== data.req.body.password){
            throw new Error("Canfirm Password does'nt match with password!")
        } else return true;
    }),
] ,async (req, res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({status: false,message: "Validation failed!", errors: errors.array()})
    }

    try {

        const passwordSalt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(req.body.password, passwordSalt)

        // Save users
        await Users.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        }).then(user=>{

            userData = {
                user_id: user._id
            };

            const signedToken = jwt.sign(userData, process.env.JWT_KEY)
            
            return res.status(200).json({
                status: true,
                message: "User's account has been created successfully!",
                userToken: encryptData(signedToken)
            })

        })

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Internal server error"
        })
    }

    // res.send("Hello world")
})

routes.post("/signin", [
    body("email").isEmail().trim().withMessage("Please provide a valid email address."),
    body("email").custom(async value=>{
        const existingUsers = await Users.findOne({email: value})
        if(!existingUsers){
            throw new Error("This email address is not associated with any user.")
        }
    }),
    body("password").custom( (value) =>{
        if(!value){
            throw new Error("Password cannot be empty.")
        }else if(value.length < 6){
            throw new Error("The password must contain at least six characters.")
        } else return true;
    }),
], async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({status: false,message: "Validation failed!", errors: errors.array()})
    }
    
    try {

        let user = await Users.findOne({email: req.body.email})

        const isMatched = await bcrypt.compare(req.body.password, user.password)

        if(!isMatched){
            return res.status(401).json({status: false, message: "Invalid password!"})
        }

        userData = {
            user_id: user._id
        }

        return res.status(200).json({status: true, message: "User has been logged in successfully!", userToken: encryptData(jwt.sign(userData, process.env.JWT_KEY))})

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Internal server error",
            error
        })
    }
})

routes.get("/get-users", jwtVerify,(req, res) => {
    res.send(req.user)
    res.render("/get-user")
})













// Common function

const encryptData = (data) => {
    return aes256.encrypt(process.env.AES256_KEY, data)
}

const decryptData = (data) => {
    return aes256.decrypt(process.env.AES256_KEY, data)
}

module.exports = routes