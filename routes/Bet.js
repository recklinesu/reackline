const express = require("express");
const jwtVerify = require("../middleware/jwtAuth");
const { body, validationResult } = require("express-validator");
const OddsBet = require("../models/Oddsbet");
const FancyBet = require("../models/Fancybet");
require("dotenv").config();


const routes = express.Router();

routes.post("/odds/save", [jwtVerify], [
    body("eventId").notEmpty().withMessage("This value is required."),
    body("legueId").notEmpty().withMessage("This value is required."),
    body("matchId").notEmpty().withMessage("This value is required."),
    body("marketId").notEmpty().withMessage("This value is required."),
    body("sportsName").notEmpty().withMessage("This value is required."),
    body("event").notEmpty().withMessage("This value is required."),
    body("markettype").notEmpty().withMessage("This value is required."),
    body("selection").notEmpty().withMessage("This value is required."),
    body("selectionId").notEmpty().withMessage("This value is required."),
    body("type").notEmpty().withMessage("This value is required."),
    body("oddsReq").notEmpty().withMessage("This value is required."),
    body("stake").notEmpty().withMessage("This value is required.").isNumeric(),
    body("placeTime").notEmpty().withMessage("This value is required."),
    body("favourMargin").notEmpty().withMessage("This value is required.").isNumeric(),
    body("againstMargin").notEmpty().withMessage("This value is required.").isNumeric(),
    body("runnersCount").notEmpty().withMessage("This value is required.").isNumeric(),
    body("runners").notEmpty().withMessage("This value is required.")
], async (req, res)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()[0]['path'] + " : " + errors.array()[0]['msg'],
        errors: errors.array(),
      });
    }

    try {
        req.body.createdBy = req.user._id;
        const saveOddsbet = new OddsBet(req.body)
        await saveOddsbet.save()

        return res.status(200).json({
            status: true,
            message: "Bet Confirmed"
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"+error,
        });
    }

})

routes.post("/fancy/save", [jwtVerify], [
    body("eventId").notEmpty().withMessage("This value is required."),
    body("legueId").notEmpty().withMessage("This value is required."),
    body("matchId").notEmpty().withMessage("This value is required."),
    body("sportsName").notEmpty().withMessage("This value is required."),
    body("event").notEmpty().withMessage("This value is required."),
    body("markettype").notEmpty().withMessage("This value is required."),
    body("selection").notEmpty().withMessage("This value is required."),
    body("selectionId").notEmpty().withMessage("This value is required."),
    body("type").notEmpty().withMessage("This value is required."),
    body("size").notEmpty().withMessage("This value is required.").isNumeric(),
    body("price").notEmpty().withMessage("This value is required.").isNumeric(),
    body("stake").notEmpty().withMessage("This value is required.").isNumeric(),
    body("placeTime").notEmpty().withMessage("This value is required."),
    body("favourMargin").notEmpty().withMessage("This value is required.").isNumeric(),
    body("againstMargin").notEmpty().withMessage("This value is required.").isNumeric(),
], async (req, res)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()[0]['path'] + " : " + errors.array()[0]['msg'],
        errors: errors.array(),
      });
    }

    try {
        req.body.createdBy = req.user._id;
        const saveOddsbet = new FancyBet(req.body)
        await saveOddsbet.save()

        return res.status(200).json({
            status: true,
            message: "Bet Confirmed"
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"+error,
        });
    }

})



module.exports = routes