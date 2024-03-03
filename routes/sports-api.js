const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const request = require('request');
const jwtVerify = require("../middleware/jwtAuth");
const headerVerify = require("../middleware/headerAuth");
const ApiOrigins = require("../models/apiOrigin");
const routePermissions = require("../GlobalFunctions/routePermission");

require("dotenv").config();

const routes = express.Router();

routes.post("/create-origin", [jwtVerify], [
    body("api").notEmpty().custom(async (e)=>{
        const check = await ApiOrigins.findOne({api: e})
        if(check){
            throw new Error("Origin already exists")
        } 
    })
], async (req, res)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
          status: false,
          message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
          errors: errors.array(),
        });
      }

      try {
        const routePermission = await routePermissions(req.user._id, ["Watcher"])

        if(!routePermission){
            return res.status(401).json({
                status: false,
                message: "This user is not allowed for the following task.",
            });
      }

        const api = req.body.api;
        const api1 = "http://"+req.body.api;
        const api2 = "https://"+req.body.api;

        const saveOrigin = await ApiOrigins.create({
            api:api,
            api1:api1,
            api2:api2
        })

        res.status(200).json({
            status: true,
            message: "API origin has been created successfully!",
            origin: saveOrigin
        })

      } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
      }
})


routes.get("/get-data", [jwtVerify], (req, res) => {
    request.get({
        url: req.body.api,
        forever: false
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            // console.log(body);
            res.send(body);
        } else {
            res.send(body); 
            // console.error("Error:", error);
            // res.status(response.statusCode).send("Error fetching data");
        }
    });
});

// Fetch events
routes.get("/fetch-events", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"?Action=listEventTypes";

        request.get({
            url: api,
            forever: false
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: body
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "Internal error!"
                }); 
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
    }
});

module.exports = routes