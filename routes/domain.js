const express = require("express");
const { body, validationResult } = require("express-validator");
const Domain = require("../models/domain");
const mongoose = require("mongoose");
const jwtVerify = require("../middleware/jwtAuth");
const routePermissions = require("../GlobalFunctions/routePermission");
require("dotenv").config();

const routes = express.Router();

routes.post("/create-domain", [jwtVerify] , [
  body("title").notEmpty().withMessage("title is required"),
  body("host").notEmpty().withMessage("host is required").custom(async(data, body)=>{
    const domain = await Domain.findOne({host: body.req.body.host})
    if(domain){
      throw new Error("Domain already exists!");
    }else{
      return true
    }
  }),
  body("primaryColor").notEmpty().withMessage("primaryColor is required"),
  body("secondaryColor").notEmpty().withMessage("secondaryColor is required"),
  body("backgroundColor").notEmpty().withMessage("backgroundColor is required"),
  body("logoUrl").notEmpty().withMessage("logoUrl is required"),
  body("favIconUrl").notEmpty().withMessage("favIconUrl is required"),

], async (req, res) => {

  const routePermission = await routePermissions(req.user._id, ["Watcher"])

  if(!routePermission){
        return res.status(401).json({
            status: false,
            message: "This user is not allowed for the following task.",
        });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({
      status: false,
      message: "Validation failed!",
      errors: errors.array(),
      });
  }

  try {

    const {
      title,
      host,
      primaryColor,
      secondaryColor,
      backgroundColor,
      logoUrl,
      favIconUrl,
    } = req.body;
    
    const newDomain = new Domain(req.body)

    await newDomain.save()

    return res.status(200).json({
      status: true,
      message: "Domain has been created successfully!",
      domain: await Domain.findById(new mongoose.Types.ObjectId(newDomain._id)),
    });

  } catch (error) {

    return res.status(500).json({
        status: false,
        message: "Internal server error : "+error,
      });
    }

});

routes.post("/update-domain/:domainId", [jwtVerify] , [
  body("title").notEmpty().withMessage("title is required"),
  body("primaryColor").notEmpty().withMessage("primaryColor is required"),
  body("secondaryColor").notEmpty().withMessage("secondaryColor is required"),
  body("backgroundColor").notEmpty().withMessage("backgroundColor is required"),
  body("logoUrl").isURL().withMessage("logoUrl is required"),
  body("favIconUrl").isURL().withMessage("favIconUrl is required"),

], async (req, res) => {

  const routePermission = await routePermissions(req.user._id, ["Watcher"])

  if(!routePermission){
        return res.status(401).json({
            status: false,
            message: "This user is not allowed for the following task.",
        });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({
      status: false,
      message: "Validation failed!",
      errors: errors.array(),
      });
  }

  try {

    const data = {
      title:req.body.title,
      primaryColor:req.body.primaryColor,
      secondaryColor:req.body.secondaryColor,
      backgroundColor:req.body.backgroundColor,
      logoUrl:req.body.logoUrl,
      favIconUrl:req.body.favIconUrl,
    }

    const checkDomain = await Domain.findById(new mongoose.Types.ObjectId(req.params.domainId))

    if(!checkDomain){
      return res.status(401).json({
        status: false,
        message: "This domain does not exists!",
    });
    }
    
    const newDomain = await Domain.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.domainId), data)

    return res.status(200).json({
      status: true,
      message: "Domain has been updated successfully!",
      domain: await Domain.findById(new mongoose.Types.ObjectId(newDomain._id)),
    });

  } catch (error) {

    return res.status(500).json({
        status: false,
        message: "Internal server error : "+error,
      });
    }

});

routes.post("/delete-domain/:domainId", [jwtVerify] , async (req, res) => {

  const routePermission = await routePermissions(req.user._id, ["Watcher"])

    if(!routePermission){
          return res.status(401).json({
              status: false,
              message: "This user is not allowed for the following task.",
          });
    }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({
      status: false,
      message: "Validation failed!",
      errors: errors.array(),
      });
  }

  try {

    const checkDomain = await Domain.findById(new mongoose.Types.ObjectId(req.params.domainId))

    if(!checkDomain){
      return res.status(401).json({
        status: false,
        message: "This domain does not exists!",
    });
    }
    
    const newDomain = await Domain.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.domainId))

    return res.status(200).json({
      status: true,
      message: "Domain has been deleted successfully!",
      domain: await Domain.findById(new mongoose.Types.ObjectId(newDomain._id)),
    });

  } catch (error) {

    return res.status(500).json({
        status: false,
        message: "Internal server error : "+error,
      });
    }

});

routes.get("/domains", async (req, res) => {
  try {
    const domains = await Domain.find(); 

    return res.status(200).json({
      status: true,
      message: "Domains retrieved successfully",
      domains,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

routes.get("/domain/:domain_id", async (req, res) => {
  try {
    const domainId = req.params.domain_id;

    if (!mongoose.Types.ObjectId.isValid(domainId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid domain ID format",
      });
    }

    const domain = await Domain.findById(domainId);

    if (!domain) {
      return res.status(404).json({
        status: false,
        message: "Domain not found",
      });
    }

    return res.status(200).json(domain);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

routes.get("/domain/host/:host_name", async (req, res) => {
  try {
    const hostName = req.params.host_name;

    if (!hostName) {
      return res.status(400).json({
        status: false,
        message: "Invalid host name format",
      });
    }

    const domain = await Domain.find({ host: hostName });

    if (!domain) {
      return res.status(404).json({
        status: false,
        message: "Domain not found",
      });
    }

    return res.status(200).json(domain);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

routes.put("/update-domain/:domain_id", async (req, res) => {
  try {
    const domainId = req.params.domain_id;

    if (!mongoose.Types.ObjectId.isValid(domainId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid domain ID format",
      });
    }

    const {
      title,
      host,
      primaryColor,
      secondaryColor,
      backgroundColor,
      logoUrl,
      favIconUrl,
    } = req.body;

    const updatedDomain = await Domain.findByIdAndUpdate(
      domainId,
      {
        title,
        host,
        primaryColor,
        secondaryColor,
        backgroundColor,
        logoUrl: logoUrl,
        favIconUrl: favIconUrl,
      },
      { new: true } // Return the updated document
    );

    if (!updatedDomain) {
      return res.status(404).json({
        status: false,
        message: "Domain not found",
      });
    }

    return res.status(200).json(updatedDomain);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

module.exports = routes;
