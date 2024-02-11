const express = require("express");
const { body, validationResult } = require("express-validator");
const Domain = require("../models/domain");
const mongoose = require("mongoose");
const jwtVerify = require("../middleware/jwtAuth");
const routePermissions = require("../GlobalFunctions/routePermission");
const masterCheck = require("../GlobalFunctions/masterCheck");
require("dotenv").config();

const routes = express.Router();


// Validation middleware for password length
const validatePasswordLength = (value, name) => {
  if (!value) {
    throw new Error("The " + name.path + " cannot be empty.");
  } else if (value.length < 6) {
    throw new Error(
      "The " + name.path + " must contain at least six characters."
    );
  }
  return true;
};


// Create New Site
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
  body("logoUrl").notEmpty().isURL().withMessage("logoUrl is required"),
  body("favIconUrl").notEmpty().isURL().withMessage("favIconUrl is required"),
  body("masterPassword").isString().notEmpty().custom(validatePasswordLength),

], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({
      status: false,
      message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
      errors: errors.array(),
      });
  }

  try {

    const masterChecked = await masterCheck(req.user._id,req.body.masterPassword)

    if(!masterChecked){
      return res.status(401).send({
        status: false,
        message: "Invalid master password!",
      });
    }

    const routePermission = await routePermissions(req.user._id, ["Watcher"])

    if(!routePermission){
          return res.status(401).json({
              status: false,
              message: "This user is not allowed for the following task.",
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


// Update Site details by id

routes.post("/update-domain/:domainId", [jwtVerify] , [
  body("title").optional().notEmpty().withMessage("title is required"),
  body("primaryColor").optional().notEmpty().withMessage("primaryColor is required"),
  body("secondaryColor").optional().notEmpty().withMessage("secondaryColor is required"),
  body("backgroundColor").optional().notEmpty().withMessage("backgroundColor is required"),
  body("logoUrl").optional().isURL().withMessage("logoUrl is required"),
  body("favIconUrl").optional().isURL().withMessage("favIconUrl is required"),
  body("status")
      .optional()
      .custom((value) => {
        if (value === "active" || value === "suspend") {
          return true;
        } else {
          throw new Error(
            "The status could be either 'active', 'suspend'"
          );
        }
      }),
  body("masterPassword").isString().notEmpty().custom(validatePasswordLength),
], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({
      status: false,
      message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
      errors: errors.array(),
      });
  }

  try {

    const masterChecked = await masterCheck(req.user._id,req.body.masterPassword)

    if(!masterChecked){
      return res.status(401).send({
        status: false,
        message: "Invalid master password!",
      });
    }

    const routePermission = await routePermissions(req.user._id, ["Watcher"])

    if(!routePermission){
          return res.status(401).json({
              status: false,
              message: "This user is not allowed for the following task.",
          });
    }

    const data = {
      title:req.body.title,
      primaryColor:req.body.primaryColor,
      secondaryColor:req.body.secondaryColor,
      backgroundColor:req.body.backgroundColor,
      logoUrl:req.body.logoUrl,
      favIconUrl:req.body.favIconUrl,
      status:req.body.status
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


// Delete Site Details by ID
routes.post("/delete-domain/:domainId", [jwtVerify] ,[
  body("masterPassword").isString().notEmpty().custom(validatePasswordLength),
], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({
      status: false,
      message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
      errors: errors.array(),
      });
  }

  try {

    const masterChecked = await masterCheck(req.user._id,req.body.masterPassword)

    if(!masterChecked){
      return res.status(401).send({
        status: false,
        message: "Invalid master password!",
      });
    }

    const routePermission = await routePermissions(req.user._id, ["Watcher"])

    if(!routePermission){
          return res.status(401).json({
              status: false,
              message: "This user is not allowed for the following task.",
          });
    }

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

// Get All Site Details
routes.get("/domains/:page?/:pageSize?", [jwtVerify], async (req, res) => {

  try {

    const routePermission = await routePermissions(req.user._id, ["Watcher"])

    if(!routePermission){
          return res.status(401).json({
              status: false,
              message: "This user is not allowed for the following task.",
          });
    }

    const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;

    const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

    const totalDocuments = await Domain.countDocuments();

    const remainingPages = Math.ceil(
      (totalDocuments - (page - 1) * pageSize) / pageSize
    );

    const totalPages = Math.ceil(totalDocuments / pageSize);

    const domains = await Domain.find().sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize); 

    return res.status(200).json({
      status: true,
        message: "Domains fetched successfully!",
        currentPage: page,
        pageSize: pageSize,
        itemCount: domains.length,
        totalPages: totalPages,
        pageItems:domains
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});


// Get Site Details by id

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


// Get Site Details By Name

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

module.exports = routes;
