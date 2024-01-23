const express = require("express");
const UserDetails = require("../GlobalFunctions/userDetails")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const Users = require("../models/user");
const aes256 = require("aes256");
require("dotenv").config();

const jwtVerify = async (req, res, next) => {
  try {
    const token = req.headers["user-token"];

    if (!token) {
      return res.status(401).send({
        auth: false,
        error: "Unauthorized",
        message: "No token provided.",
      });
    }

    const data = jwt.verify(token, process.env.JWT_KEY);
    const user_id = data.user_id;

    const user = await UserDetails(user_id)

    if (!user) {
      return res.status(403).send({
        auth: false,
        error: "Unauthorized",
        message: "Access token expired!",
      });
    }

    req.user = user;

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

module.exports = jwtVerify;
