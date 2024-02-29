const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const routes = express.Router();

routes.get("/get-data", (req, res)=>{
    fetch("http://142.93.36.1/api/v1/fetch_data?Action=listEventTypes")
    .then(x => console.log(x))
    .then(y => res.json(y));
    // res.send("hello")
})

module.exports = routes