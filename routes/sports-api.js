const express = require("express");
const mongoose = require("mongoose");
const request = require('request');
require("dotenv").config();

const routes = express.Router();


routes.get("/get-data", (req, res) => {
    request.get({
        url: req.body.api,
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

module.exports = routes