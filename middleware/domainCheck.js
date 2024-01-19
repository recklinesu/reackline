const express = require("express");
const Domains = require('../models/domain');

const domainCheck = async (req, res, next) => {
    try {
        const host = req.headers["d"];
        const hostDetails = await Domains.findOne({host: host})
        if(!hostDetails){
            return res.status(401).json({message:"Invalid Domain"});
        }
        next()
         
    } catch (error) {
        return res
        .status(403)
        .send({ auth: false, error: "Unauthorized", message: "Invalid host!" });
    }
}

module.exports = domainCheck;