const express = require("express");
const Domains = require("../models/domain");
const mongoose = require("mongoose");

const domainCheck = async (req, res, next) => {

  try {
    const domainId = req.headers["d"];
    
    const hostDetails = await Domains.findById(
      new mongoose.Types.ObjectId(domainId)
    );

    if (!hostDetails) {
      return res.status(401).json({
        status: false,
        error: "Unauthorized",
        message: "Invalid domain!",
      });
    }

    req.domainId = domainId;
    next();

  } catch (error) {
    return res
      .status(403)
      .json({ status: false, error: "Unauthorized", message: "Invalid host!" });
  }

};

module.exports = domainCheck;
