const express = require("express");
const Domains = require("../models/domain");
const mongoose = require("mongoose");
const Role = require("../models/roles");

const watcherAuth = async (req, res, next) => {

  try {
    
    const hostName = req.headers['host'];
    // if (!host || !host.includes(':')) return res.status(401).send({ error : "Invalid Host Header" });
    const filterCriteria = {
        $or: [{ host: hostName  }, { adminHost: hostName }],
      }

    let domainId = null;
    const domainData = await Domains.findOne(filterCriteria)

    if(!domainData){
        const data = {
            title: hostName,
            host: hostName,
            adminHost: "admin."+hostName,
            primaryColor: "#3782f5",
            secondaryColor : "#96cbfe",
            backgroundColor: "#ffffff",
            logoUrl: "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
            favIconUrl: "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
          };

        const domainNew = await Domains.create(data);
        domainId = domainNew._id;
    }else{
        domainId = domainData._id;
    }    

    
    const role = await Role.findOne({name:"Watcher"})
    
    req.domain = domainId
    req.role = role._id;
    
    next();

  } catch (error) {
    return res
      .status(403)
      .json({ status: false, error: "Unauthorized", message: "Invalid host!"+error });
  }

};

module.exports = watcherAuth;
