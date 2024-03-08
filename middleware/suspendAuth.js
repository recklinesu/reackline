const express = require("express");
const UserDetails = require("../GlobalFunctions/userDetails")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const Users = require("../models/user");
const aes256 = require("aes256");
require("dotenv").config();

const suspendAuth = async (req, res, next) => {
    try {

        if (req.user.status === "suspend") {
            return res.status(401).json({
                status: false,
                message: "Your account has been suspended, you can't perform this action.",
            });
        }

        next();

    } catch (error) {
        console.error("Error during JWT verification:", error);
        return res
            .status(403)
            .send({ auth: false, error: "Unauthorized", message: "Invalid token!" });
    }
};

const encryptData = (data) => aes256.encrypt(process.env.AES256_KEY, data);

const decryptData = (data) => aes256.decrypt(process.env.AES256_KEY, data);

module.exports = suspendAuth;
