const express = require("express");
const Domains = require("../models/domain");
const mongoose = require("mongoose");
const ApiOrigins = require("../models/apiOrigin");

const headerVerify = async (req, res, next) => {

  try {
    const domainName = req.headers["origin"];

    if(!domainName){
      return res
      .status(401)
      .json({ status: false, error: "Unauthorized Access", message: "Invalid Request, please purchase in order to use this api." });    }
    
    const filterCriteria = {
        $or: [{ api: domainName  }, { api1: domainName }, {api2: domainName}],
    }

    const domainData = await ApiOrigins.findOne(filterCriteria)

    if(!domainData){
        return res
      .status(401)
      .json({ status: false, error: "Unauthorized Access", message: "Invalid Request, please purchase in order to use this api." });
    }

    next();

  } catch (error) {
    return res
      .status(401)
      .json({ status: false, error: "Unauthorized Access", message: "Invalid Request, please purchase in order to use this api." });
  }

};

module.exports = headerVerify;
