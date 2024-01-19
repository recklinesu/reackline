const express = require("express");
const { body, validationResult } = require("express-validator");
const Domain = require("../models/domain");
const mongoose = require("mongoose");
require("dotenv").config();

const routes = express.Router();

routes.post("/create-domain", async (req, res) => {
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

    if (!title || !host) {
      return res.status(400).json({
        status: false,
        message: "Title and host are required fields",
      });
    }

    const newDomain = new Domain({
      title,
      host,
      primaryColor: primaryColor || process.env.DEFAULT_COLOR,
      secondaryColor: secondaryColor || process.env.DEFAULT_COLOR,
      backgroundColor: backgroundColor || process.env.DEFAULT_COLOR,
      logoUrl: logoUrl || process.env.DEFAULT_LOGO,
      favIconUrl: favIconUrl || process.env.DEFAULT_FAV_ICON,
    });

    await newDomain.save();

    return res.status(201).json({
      status: true,
      message: "Domain created successfully",
      domain: newDomain,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
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
