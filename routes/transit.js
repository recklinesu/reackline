const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const aes256 = require("aes256");
const Users = require("../models/user");
const PassowordHistory = require("../models/passwordHistory");
const Roles = require("../models/roles");
const Transactions = require("../models/transaction")
const CreditTransaction = require("../models/creaditReferenceTransaction");
const PartnershipTransaction = require("../models/partnershipTransaction");
const jwtVerify = require("../middleware/jwtAuth");
const suspendVerify = require("../middleware/jwtAuth");
const domainCheck = require("../middleware/domainCheck");
const PermissionCheck = require("../GlobalFunctions/permissioncheck");
const UserDetails = require("../GlobalFunctions/userDetails")
const CanCreate = require("../GlobalFunctions/canCreate");
const masterCheck = require("../GlobalFunctions/masterCheck");
const routePermissions = require("../GlobalFunctions/routePermission");
const permissionCheck = require("../GlobalFunctions/permissioncheck");
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

// add money  to user wallet
routes.post("/add-balance", [jwtVerify, suspendVerify], [

    body("balance").isNumeric().withMessage("Please provide valid  amount.").notEmpty().withMessage("Please provide valid  amount."),
    body("remark").optional().isString(),
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

        const masterChecked = await masterCheck(req.user._id, req.body.masterPassword)

        if(!masterChecked){
            return res.status(401).send({ auth: false, message: "Invalid master password."})
        }

        const permissionCheck = await routePermissions(req.user._id, ["Watcher"])

        if(!permissionCheck){
            return res.status(401).send({ auth: false, message: "You do not have permission to perform this action."})
        }

        const remark = req.body.remark??null
        
        const money = parseInt(req.body.balance)
        
        const currentOpeningBalance = parseInt(req.user.openingBalance);

        const newOpeningBalance = (currentOpeningBalance+money)

        const moneyUpdate = await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(req.user._id), {openingBalance: newOpeningBalance})

        if(!moneyUpdate){
            await transactionLog(req.user._id, req.user._id, money, "failed",  "Adding money in self account has been failed.", remark, req.user.openingBalance, req.user.openingBalance)
            return res.status(400).json({
                status: false,
                message:"Somthing went wrong while updating wallet!"
            })
        }

        await transactionLog(req.user._id, req.user._id, money, "success",  "Amount has been added in self account successfully!", remark, newOpeningBalance, newOpeningBalance)

        return res.status(200).json({
            status: true,
            message:"Wallet has been updated successfully, your current balance is : "+newOpeningBalance
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"Internal error!"+error.message
        })
    }
})

// transfer money  to user wallet
routes.post("/transfer-balance/:userId", [jwtVerify, suspendVerify], [

    body("balance").isNumeric().withMessage("Please provide valid  amount.").notEmpty().withMessage("Please provide valid  amount."),
    body("remark").optional().isString(),
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

        const masterChecked = await masterCheck(req.user._id, req.body.masterPassword)

        if(!masterChecked){
            return res.status(401).send({ auth: false, message: "Invalid master password."})
        }
        
        const permissionChecked = await permissionCheck(req.user._id, req.params.userId)

        if(!permissionChecked){
            return res.status(401).send({ auth: false, message: "You do not have permission to perform this action."})
        }

        const remark = req.body.remark??null

        const balance = parseInt(req.body.balance)

        const payerOpeningBalance = parseInt(req.user.openingBalance)

        const payeeDetails = await UserDetails(req.params.userId)

        const payeeBalance = parseInt(payeeDetails.openingBalance)

        if(payerOpeningBalance < balance){
            await transactionLog(payeeDetails._id, req.user._id, balance, "failed",  "Insufficient Balance.", remark, payeeDetails.openingBalance, req.user.openingBalance)
            return res.status(401).json({
                status:false,
                message:"You don't have sufficient balance in your wallet."
            })
        }

        const payerNewOpeningBalance = (payerOpeningBalance-balance)

        const payeeNewBalance = (payeeBalance+balance)

        const updatedPayee = await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.userId), {openingBalance: payeeNewBalance})

        const updatedPayer =  await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(req.user._id), {openingBalance: payerNewOpeningBalance})

        if(!updatedPayee || !updatedPayer){
            await transactionLog(payeeDetails._id, req.user._id, balance, "failed",  "Transaction has been suddenly terminated, in case amount debited then contact to administrator.", remark, payeeDetails.openingBalance, req.user.openingBalance)
            return res.status(401).json({
                status:false,
                message:"Somthing went wrong!"
            })
        }

        await transactionLog(payeeDetails._id, req.user._id, balance, "success",  "Amount has been transfered successfully.", remark, payeeNewBalance, payerNewOpeningBalance)

        return res.status(200).json({
            status: true,
            message: "Amount of '"+balance+"' has been transferred successfully to "+payeeDetails.userName+"'s account."
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"Internal error!"+error.message
        })
    }
})

// Withdraw money  to user wallet
routes.post("/withdraw-balance/:userId", [jwtVerify, suspendVerify], [

    body("balance").isNumeric().withMessage("Please provide valid  amount.").notEmpty().withMessage("Please provide valid  amount."),
    body("remark").optional().isString(),
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

        const masterChecked = await masterCheck(req.user._id, req.body.masterPassword)

        if(!masterChecked){
            return res.status(401).send({ auth: false, message: "Invalid master password."})
        }
        
        const permissionChecked = await permissionCheck(req.user._id, req.params.userId)

        if(!permissionChecked){
            return res.status(401).send({ auth: false, message: "You do not have permission to perform this action."})
        }

        const remark = req.body.remark??null

        const balance = parseInt(req.body.balance)

        const PayerDetails = await UserDetails(req.params.userId)

        const payerOpeningBalance = parseInt(PayerDetails.openingBalance)

        const payeeBalance = parseInt(req.user.openingBalance)

        if(payerOpeningBalance < balance){
            await transactionLog(req.user._id, PayerDetails._id, balance, "failed",  "Insufficient Balance.", remark, req.user.openingBalance, PayerDetails.openingBalance)
            return res.status(401).json({
                status:false,
                message:"User don't have sufficient balance in his wallet."
            })
        }

        const payerNewOpeningBalance = (payerOpeningBalance-balance)

        const payeeNewBalance = (payeeBalance+balance)

        const updatedPayee = await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(req.user._id), {openingBalance: payeeNewBalance})

        const updatedPayer =  await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.userId), {openingBalance: payerNewOpeningBalance})

        if(!updatedPayee || !updatedPayer){
            await transactionLog(req.user._id, PayerDetails._id, balance, "failed",  "Transaction has been suddenly terminated, in case amount debited then contact to administrator.", remark, req.user.openingBalance, PayerDetails.openingBalance)
            return res.status(401).json({
                status:false,
                message:"Somthing went wrong!"
            })
        }

        await transactionLog(req.user._id, PayerDetails._id, balance, "success",  "Amount has been recieved successfully.", remark, payeeNewBalance, payerNewOpeningBalance)

        return res.status(200).json({
            status: true,
            message: "Amount of '"+balance+"' has been recieved successfully from "+PayerDetails.userName+"'s account."
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"Internal error!"+error.message
        })
    }
})


// transaction history to user wallet
routes.post("/transactions/:page?/:pageSize?", [jwtVerify], [

    body("filter").optional().custom((value) => {
        if (value === "sent" || value === "received") {
          return true;
        } else {
          throw new Error(
            "The status could be either 'sent', 'received'"
          );
        }
    }),

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

        const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;
        
        const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

        let filterCriteria = null;
        let userIdFilter = null;

        if(req.body.userId){
            userIdFilter = req.body.userId;
        }else{
            userIdFilter = req.user._id;
        }

        if(req.body.filter){
            filterCriteria = req.body.filter === "sent" ? { payer: userIdFilter } : { payee: userIdFilter };
        }else{
            filterCriteria = {
                $or: [{ payee: userIdFilter  }, { payer: userIdFilter  }],
            }
        }

        const totalDocuments = await Transactions.countDocuments(filterCriteria);

        const remainingPages = Math.ceil(
            (totalDocuments - (page - 1) * pageSize) / pageSize
          );
      
        const totalPages = Math.ceil(totalDocuments / pageSize);


        const transactions = await Transactions.find(filterCriteria)
        .populate("payee", "userName name openingBalance")
        .populate("payer", "userName name openingBalance").sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

        if(!transactions.length){
        return res.status(200).json({
            status: true,
            message: "No data found!"
        })
        }else{
        return res.status(200).json({
            status: true,
            message: "Transactions fetched successfully.",
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

// credit reference transaction history to user wallet
routes.post("/credit-transactions/:page?/:pageSize?", [jwtVerify], [

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

        const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;
        
        const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

        let userIdFilter = null;

        if(req.body.userId){
            userIdFilter = req.body.userId;
        }else{
            userIdFilter = req.user._id;
        }

        const filterCriteria = { of: userIdFilter };

        const totalDocuments = await CreditTransaction.countDocuments(filterCriteria);

        const remainingPages = Math.ceil(
            (totalDocuments - (page - 1) * pageSize) / pageSize
          );
      
        const totalPages = Math.ceil(totalDocuments / pageSize);


        const transactions = await CreditTransaction.find(filterCriteria)
        .populate("from", "userName name")
        .populate("of", "userName name").sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

        if(!transactions.length){
        return res.status(200).json({
            status: true,
            message: "No data found!"
        })
        }else{
        return res.status(200).json({
            status: true,
            message: "Credit reference transactions fetched successfully.",
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

// Partnership transaction history to user wallet
routes.post("/partnership-transactions/:page?/:pageSize?", [jwtVerify], [

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

        const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;
        
        const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

        let userIdFilter = null;

        if(req.body.userId){
            userIdFilter = req.body.userId;
        }else{
            userIdFilter = req.user._id;
        }

        const filterCriteria = { of: userIdFilter };

        const totalDocuments = await PartnershipTransaction.countDocuments(filterCriteria);

        const remainingPages = Math.ceil(
            (totalDocuments - (page - 1) * pageSize) / pageSize
          );
      
        const totalPages = Math.ceil(totalDocuments / pageSize);


        const transactions = await PartnershipTransaction.find(filterCriteria)
        .populate("from", "userName name")
        .populate("of", "userName name").sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

        if(!transactions.length){
        return res.status(200).json({
            status: true,
            message: "No data found!"
        })
        }else{
        return res.status(200).json({
            status: true,
            message: "Partnership transactions fetched successfully.",
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



const transactionLog = async (payee, payer, amount, status, message, remark, openingBalancePayee, openingBalancePayer)=>{
    try {
        const logTransit = await Transactions.create({
            payee,
            payer,
            amount,
            message,
            status,
            remark,
            openingBalancePayee,
            openingBalancePayer
        });
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = routes