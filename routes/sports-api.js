const express = require("express");
const mongoose = require("mongoose");
const request = require('request');
const jwtVerify = require("../middleware/jwtAuth");
const headerVerify = require("../middleware/headerAuth");
require("dotenv").config();

const routes = express.Router();


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