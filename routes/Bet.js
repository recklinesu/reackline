const express = require("express");
const jwtVerify = require("../middleware/jwtAuth");
const { body, validationResult } = require("express-validator");
const BetModel = require("../models/Bet");
const { default: mongoose } = require("mongoose");
require("dotenv").config();


const routes = express.Router();

routes.post("/save", [jwtVerify], [
  body("eventId").notEmpty().withMessage("This value is required."),
  body("legueId").notEmpty().withMessage("This value is required."),
  body("matchId").notEmpty().withMessage("This value is required."),
  body("sportsName").notEmpty().withMessage("This value is required."),
  body("event").notEmpty().withMessage("This value is required."),
  body("markettype").notEmpty().withMessage("This value is required."),
  body("selection").notEmpty().withMessage("This value is required."),
  body("selectionId").notEmpty().withMessage("This value is required."),
  body("type").notEmpty().withMessage("This value is required."),
  body("stake").notEmpty().withMessage("This value is required.").isNumeric(),
  body("placeTime").notEmpty().withMessage("This value is required."),
  body("favourMargin").notEmpty().withMessage("This value is required.").isNumeric(),
  body("againstMargin").notEmpty().withMessage("This value is required.").isNumeric(),
  body("marketId").optional(),
  body("oddsReq").optional(),
  body("runnersCount").optional(),
  body("runners").optional(),
  body("size").optional(),
  body("price").optional(),
], async (req, res) => {
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
    const saveOddsbet = new BetModel(req.body)
    await saveOddsbet.save()

    return res.status(200).json({
      status: true,
      message: "Bet Confirmed"
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error" + error,
    });
  }

})

// All transaction history to user wallet
routes.post("/history/:page?/:pageSize?", [jwtVerify], [

  body("userId").optional().custom(async (value) => {
    const data = await Users.findById(new mongoose.Types.ObjectId(value));
    if (!data) {
      throw new Error('User not found!')
    }
  }),
  body("status")
    .optional()
    .custom((value) => {
      if (value === "settled" || value === "unsettled" || value === "void") {
        return true;
      } else {
        throw new Error(
          "The status could be either 'settled', 'unsettled' or 'void'"
        );
      }
    }),
  body("sportsName").optional().notEmpty().withMessage("Sport name is required."),

], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: errors.array()[0]['path'] + " : " + errors.array()[0]['msg'],
      errors: errors.array(),
    });
  }
  try {

    const page = req.params.page
      ? parseInt(req.params.page) < 1
        ? 1
        : parseInt(req.params.page)
      : 1;
    const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

    let userIdFilter = null;

    if (req.body.userId) {
      userIdFilter = req.body.userId;
    } else {
      userIdFilter = req.user._id;
    }

    const filterCriteria = { createdBy: userIdFilter };

    if (req.body.status) {
      filterCriteria["status"] = req.body.status;
    }

    if (req.body.sportsName) {
      filterCriteria["sportsName"] = req.body.sportsName;
    }

    const totalDocuments = await BetModel.countDocuments(filterCriteria);

    const remainingPages = Math.ceil(
      (totalDocuments - (page - 1) * pageSize) / pageSize
    );

    const totalPages = Math.ceil(totalDocuments / pageSize);


    const transactions = await BetModel.find(filterCriteria).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

    if (!transactions.length) {
      return res.status(200).json({
        status: true,
        message: "No data found!"
      })
    } else {
      return res.status(200).json({
        status: true,
        message: "Bets history fetched successfully.",
        currentPage: page,
        pageSize: pageSize,
        itemCount: transactions.length,
        totalPages: totalPages,
        pageItems: transactions
      })
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal error!" + error.message
    })
  }
})

routes.get("/trade/list", [jwtVerify], async (req, res) => {
  try {

    const data = await BetModel.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user._id), // Add your user ID here to filter data created by you
          status: "unsettled"
        }
      },
      {
        $group: {
          _id: "$matchId", // Group by matchId field
          totalStake: { $sum: "$stake" }, // Calculate the total stake for each matchId
          sportsName: { $first: "$sportsName" }, // Include the first sportsName within each group
          matchId: { $first: "$matchId" }, // Include the first sportsName within each group
          event: { $first: "$event" }, // Include the first event within each group
          markettype: { $first: "$markettype" }, // Include the first event within each group
          count: { $sum: 1 } // Count documents in each group
        }
      }
    ]);

    res.status(200).json({
      status: true,
      message: "Trades has been fetched successfully!",
      data
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal error!" + error.message
    })
  }
})


routes.get("/bet-details/list/:matchId", [jwtVerify], async (req, res) => {
  try {

    const data = await BetModel.find({matchId: req.params.matchId, createdBy: new mongoose.Types.ObjectId(req.user._id), status: "unsettled"})

    res.status(200).json({
      status: true,
      message: "Bets has been fetched successfully!",
      data
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal error!" + error.message
    })
  }
})

routes.get("/get-selection-group/list/:matchId", [jwtVerify], async (req, res) => {
  try {

    const data = await BetModel.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user._id), // Add your user ID here to filter data created by you
          status: "unsettled",
          matchId: req.params.matchId
        }
      },
      {
        $group: {
          _id: "$selectionId", // Group by matchId field
          totalStake: { $sum: "$stake" }, // Calculate the total stake for each matchId
          favourMargin: { $sum: "$favourMargin" }, // Include the first sportsName within each group
          againstMargin: { $sum: "$againstMargin" }, // Include the first sportsName within each group
          markettype: { $first: "$markettype" }, // Include the first event within each group
          count: { $sum: 1 } // Count documents in each group
        }
      }
    ]);
    res.status(200).json({
      status: true,
      message: "Bets has been fetched successfully!",
      data
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal error!" + error.message
    })
  }
})
module.exports = routes