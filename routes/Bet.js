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


// Odds unsettled transaction history to user wallet
routes.post("/odds/histrory/unsettled/:page?/:pageSize?", [jwtVerify], [

    body("userId").optional().custom(async (value) => {
        const data = await Users.findById(new mongoose.Types.ObjectId(value));
        if(!data){
            throw new Error('User not found!')
        }
    })

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

        const page = parseInt(req.params.page) || 1;
        
        const pageSize = parseInt(req.params.limit) || 10; 

        let userIdFilter = null;

        if(req.body.userId){
            userIdFilter = req.body.userId;
        }else{
            userIdFilter = req.user._id;
        }

        const filterCriteria = { createdBy: userIdFilter, status: "unsettled" };

        const totalDocuments = await OddsBet.countDocuments(filterCriteria);

        const remainingPages = Math.ceil(
            (totalDocuments - (page - 1) * pageSize) / pageSize
          );
      
        const totalPages = Math.ceil(totalDocuments / pageSize);


        const transactions = await OddsBet.find(filterCriteria).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

        if(!transactions.length){
        return res.status(200).json({
            status: true,
            message: "No data found!"
        })
        }else{
        return res.status(200).json({
            status: true,
            message: "Odds history fetched successfully.",
            currentPage: page,
            pageSize: pageSize,
            itemCount: transactions.length,
            totalPages: totalPages,
            pageItems:transactions
        })
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"Internal error!"+error.message
        })
    }
})

// Odds settled transaction history to user wallet
routes.post("/odds/histrory/settled/:page?/:pageSize?", [jwtVerify], [

    body("userId").optional().custom(async (value) => {
        const data = await Users.findById(new mongoose.Types.ObjectId(value));
        if(!data){
            throw new Error('User not found!')
        }
    })

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

        const page = parseInt(req.params.page) || 1;
        
        const pageSize = parseInt(req.params.limit) || 10; 

        let userIdFilter = null;

        if(req.body.userId){
            userIdFilter = req.body.userId;
        }else{
            userIdFilter = req.user._id;
        }

        const filterCriteria = { createdBy: userIdFilter, status: "settled" };

        const totalDocuments = await OddsBet.countDocuments(filterCriteria);

        const remainingPages = Math.ceil(
            (totalDocuments - (page - 1) * pageSize) / pageSize
          );
      
        const totalPages = Math.ceil(totalDocuments / pageSize);


        const transactions = await OddsBet.find(filterCriteria).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

        if(!transactions.length){
        return res.status(200).json({
            status: true,
            message: "No data found!"
        })
        }else{
        return res.status(200).json({
            status: true,
            message: "Odds history fetched successfully.",
            currentPage: page,
            pageSize: pageSize,
            itemCount: transactions.length,
            totalPages: totalPages,
            pageItems:transactions
        })
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"Internal error!"+error.message
        })
    }
})

// Odds transaction history to user wallet
routes.post("/odds/histrory/:page?/:pageSize?", [jwtVerify], [

    body("userId").optional().custom(async (value) => {
        const data = await Users.findById(new mongoose.Types.ObjectId(value));
        if(!data){
            throw new Error('User not found!')
        }
    })

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

        const page = parseInt(req.params.page) || 1;
        
        const pageSize = parseInt(req.params.limit) || 10; 

        let userIdFilter = null;

        if(req.body.userId){
            userIdFilter = req.body.userId;
        }else{
            userIdFilter = req.user._id;
        }

        const filterCriteria = { createdBy: userIdFilter };

        const totalDocuments = await OddsBet.countDocuments(filterCriteria);

        const remainingPages = Math.ceil(
            (totalDocuments - (page - 1) * pageSize) / pageSize
          );
      
        const totalPages = Math.ceil(totalDocuments / pageSize);


        const transactions = await OddsBet.find(filterCriteria).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

        if(!transactions.length){
        return res.status(200).json({
            status: true,
            message: "No data found!"
        })
        }else{
        return res.status(200).json({
            status: true,
            message: "Odds history fetched successfully.",
            currentPage: page,
            pageSize: pageSize,
            itemCount: transactions.length,
            totalPages: totalPages,
            pageItems:transactions
        })
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"Internal error!"+error.message
        })
    }
})

// Fancy unsettled transaction history to user wallet
routes.post("/fancy/histrory/unsettled/:page?/:pageSize?", [jwtVerify], [

    body("userId").optional().custom(async (value) => {
        const data = await Users.findById(new mongoose.Types.ObjectId(value));
        if(!data){
            throw new Error('User not found!')
        }
    })

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

        const page = parseInt(req.params.page) || 1;
        
        const pageSize = parseInt(req.params.limit) || 10; 

        let userIdFilter = null;

        if(req.body.userId){
            userIdFilter = req.body.userId;
        }else{
            userIdFilter = req.user._id;
        }

        const filterCriteria = { createdBy: userIdFilter, status: "unsettled" };

        const totalDocuments = await FancyBet.countDocuments(filterCriteria);

        const remainingPages = Math.ceil(
            (totalDocuments - (page - 1) * pageSize) / pageSize
          );
      
        const totalPages = Math.ceil(totalDocuments / pageSize);


        const transactions = await FancyBet.find(filterCriteria).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

        if(!transactions.length){
        return res.status(200).json({
            status: true,
            message: "No data found!"
        })
        }else{
        return res.status(200).json({
            status: true,
            message: "Odds history fetched successfully.",
            currentPage: page,
            pageSize: pageSize,
            itemCount: transactions.length,
            totalPages: totalPages,
            pageItems:transactions
        })
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"Internal error!"+error.message
        })
    }
})

// Fancy settled transaction history to user wallet
routes.post("/fancy/histrory/settled/:page?/:pageSize?", [jwtVerify], [

    body("userId").optional().custom(async (value) => {
        const data = await Users.findById(new mongoose.Types.ObjectId(value));
        if(!data){
            throw new Error('User not found!')
        }
    })

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

        const page = parseInt(req.params.page) || 1;
        
        const pageSize = parseInt(req.params.limit) || 10; 

        let userIdFilter = null;

        if(req.body.userId){
            userIdFilter = req.body.userId;
        }else{
            userIdFilter = req.user._id;
        }

        const filterCriteria = { createdBy: userIdFilter, status: "settled" };

        const totalDocuments = await FancyBet.countDocuments(filterCriteria);

        const remainingPages = Math.ceil(
            (totalDocuments - (page - 1) * pageSize) / pageSize
          );
      
        const totalPages = Math.ceil(totalDocuments / pageSize);


        const transactions = await FancyBet.find(filterCriteria).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

        if(!transactions.length){
        return res.status(200).json({
            status: true,
            message: "No data found!"
        })
        }else{
        return res.status(200).json({
            status: true,
            message: "Odds history fetched successfully.",
            currentPage: page,
            pageSize: pageSize,
            itemCount: transactions.length,
            totalPages: totalPages,
            pageItems:transactions
        })
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"Internal error!"+error.message
        })
    }
})

// Fancy transaction history to user wallet
routes.post("/fancy/histrory/:page?/:pageSize?", [jwtVerify], [

    body("userId").optional().custom(async (value) => {
        const data = await Users.findById(new mongoose.Types.ObjectId(value));
        if(!data){
            throw new Error('User not found!')
        }
    })

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

        const page = parseInt(req.params.page) || 1;
        
        const pageSize = parseInt(req.params.limit) || 10; 

        let userIdFilter = null;

        if(req.body.userId){
            userIdFilter = req.body.userId;
        }else{
            userIdFilter = req.user._id;
        }

        const filterCriteria = { createdBy: userIdFilter };

        const totalDocuments = await FancyBet.countDocuments(filterCriteria);

        const remainingPages = Math.ceil(
            (totalDocuments - (page - 1) * pageSize) / pageSize
          );
      
        const totalPages = Math.ceil(totalDocuments / pageSize);


        const transactions = await FancyBet.find(filterCriteria).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

        if(!transactions.length){
        return res.status(200).json({
            status: true,
            message: "No data found!"
        })
        }else{
        return res.status(200).json({
            status: true,
            message: "Odds history fetched successfully.",
            currentPage: page,
            pageSize: pageSize,
            itemCount: transactions.length,
            totalPages: totalPages,
            pageItems:transactions
        })
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"Internal error!"+error.message
        })
    }
})

module.exports = routes