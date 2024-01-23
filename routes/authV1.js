const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const aes256 = require("aes256");
const Users = require("../models/user");
const PassowordHistory = require("../models/passwordHistory")
const jwtVerify = require("../middleware/jwtAuth");
const domainCheck = require("../middleware/domainCheck");
const PermissionCheck = require("../GlobalFunctions/permissioncheck")
require("dotenv").config();

const routes = express.Router();

// Validation middleware for common checks
const validateUserNameExists = async (value) => {
  const existingUser = await Users.findOne({ userName: value });
  if (existingUser) {
    throw new Error("This username is already associated with a user.");
  }
};

// Validation middleware for password length
const validatePasswordLength = (value,name) => {
  if (!value) {
    throw new Error("The "+name.path+" cannot be empty.");
  } else if (value.length < 6) {
    throw new Error("The "+name.path+" must contain at least six characters.");
  }
  return true;
};

const validatePasswordMatch = (value, data) =>{
  if(!value){
      throw new Error ("The "+data.path+" cannot be empty")    
  }else if (value !== data.req.body.newPassword) {
      throw new Error ("The "+data.path+" doesn't match with newPassword.")
  } else return true;
}

// Sign up route
routes.post(
  "/signup", [jwtVerify],
  [
    body("name").isString(),
    body("userName").isString().notEmpty().custom(validateUserNameExists),
    body("commission").isNumeric(),
    body("openingBalance").isNumeric(),
    body("creditReference").isNumeric(),
    body("mobile").isNumeric(),
    body("exposureLimit").isNumeric(),
    body("password").isString().notEmpty().custom(validatePasswordLength),
    body("role").isString().notEmpty(),
    body("domain").isString().notEmpty(),
  ],
  async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: "Validation failed!",
        errors: errors.array(),
      });
    }

    try {

      const {
        name,
        userName,
        commission,
        openingBalance,
        creditReference,
        mobile,
        exposureLimit,
        password,
        role,
        domain,
      } = req.body;

      // res.send(permissionCheckup);

      const passwordSalt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, passwordSalt);

      const user = await Users.create({
        name,
        userName,
        commission,
        openingBalance,
        creditReference,
        mobile,
        exposureLimit,
        password: hashedPassword,
        role,
        domain,
        createdBy: "659dbc4d05202eb8b2562f21", // make it dynamic
      });

      return res.status(200).json({
        status: true,
        message: "User's account has been created successfully!",
        userDetails: user,
      });
    } catch (error) {
      console.error("Error during user creation:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  }
);

// Sign in route
routes.post(
  "/signin", [domainCheck],
  [
    body("password").custom(validatePasswordLength),
    body("userName").isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: "Validation failed!",
        errors: errors.array(),
      });
    }

    try {
      let user = await Users.findOne({
        userName: req.body.userName,
      });

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "This username is not associated with any user.",
        });
      }

      if (user.status !== "active") {
        return res.status(401).json({
          status: false,
          message: "This user's profile is "+user.status,
        });
      }

      const isMatched = await bcrypt.compare(req.body.password, user.password);

      if (!isMatched) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid password!" });
      }

      const userData = {
        user_id: user._id,
      };

      const userToken = jwt.sign(userData, process.env.JWT_KEY);

      const newuser = await Users.findOne({ userName: req.body.userName }).select("-password");

      return res.status(200).json({
        status: true,
        message: "User has been logged in successfully!",
        userToken: userToken,
        user: newuser,
      });
    } catch (error) {
      console.error("Error during user sign-in:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  }
);

// Get users route with JWT verification
routes.get("/get-users", jwtVerify, async (req, res) => {
  // console.log("Helllo ============>", req.user, req);
  const users = await Users.find({}, "-password"); // Exclude the password field from the response

  return res.status(200).json({
    status: true,
    message: "Users retrieved successfully",
    users: users,
  });
});

// update user's password route with JWT verification
routes.post("/update-password/:userId?", [jwtVerify], [

  body("currentPassword").custom(validatePasswordLength),
  body("newPassword").custom(validatePasswordLength),
  body('confirmPassword').custom(validatePasswordMatch)

], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: "Validation failed!",
      errors: errors.array(),
    });
  }

  try {

    if(userId){
      let userId = req.params.userId;

      const isMatched = await bcrypt.compare(req.body.currentPassword, req.user.password);
  
      if (!isMatched) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid password!" });
      }

    }else{
      const isMatched = await bcrypt.compare(req.body.currentPassword, req.user.password);
  
      if (!isMatched) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid password!" });
      }
  
      const passwordSalt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.confirmPassword, passwordSalt);
  
      const userPasswordUpdated = await Users.findOneAndUpdate({userName: req.user.userName, domain: req.user.domain}, {password: hashedPassword})
    }


    if (!userPasswordUpdated) {
      return res
        .status(401)
        .json({ status: false, message: "Something went wrong!" });
    }

    if(!updateHistoryOfPassword(req.user._id, req.user._id)){
      console.log(`Failed to add history of the updated password for ${req.userName}`)
    }

    return res.status(200).json({
      status: true,
      message: req.user.userName+"'s password has been updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }

});

// update user's status route with JWT verification
routes.post("/update-users-status", [jwtVerify], [

  body("status").custom(value=>{
    if(value === "active" || value === "suspend" || value === "locked"){
      return true;
    }else{
      throw new Error("The status could be either 'active', 'suspend' or 'locked'");
    }
  })

], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: "Validation failed!",
      errors: errors.array(),
    });
  }

  try {
    const userUpdated = await Users.findOneAndUpdate({userName: req.user.userName, domain: req.user.domain}, {status: req.body.status})

    if (!userUpdated) {
      return res
        .status(401)
        .json({ status: false, message: "Something went wrong!" });
    }

    return res.status(200).json({
      status: true,
      message: req.user.userName+"'s status has been updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }

});

// get password update history route with JWT verification
routes.get("/password-update-history/:page?/:pageSize?", [jwtVerify] , async (req, res) => {
  try {

    const page = (req.params.page)?((parseInt(req.params.page) < 1)?1:parseInt(req.params.page)):1;
    const pageSize = (req.params.pageSize)?parseInt(req.params.pageSize):10;

    const totalDocuments = await PassowordHistory.countDocuments({updatedOf:req.user._id});

    const remainingPages = Math.ceil((totalDocuments - (page - 1) * pageSize) / pageSize);

    const totalPages = Math.ceil(totalDocuments / pageSize);

    const userPassUpdateHistroy = await PassowordHistory.aggregate([
      {
        $match:{
          updatedOf:req.user._id
        }
      },
      {
        $lookup:{
          from:"users",
          localField: 'updatedBy',
          foreignField: '_id',
          as: "userDetailsBy",
        }
      },
      {
        $lookup:{
          from:"users",
          localField: 'updatedOf',
          foreignField: '_id',
          as: "userDetailsOf",
        }
      },
      {
        $project: {
          createdAt: "$createdAT",
          updatedOf: "$userDetailsOf.userName",
          updatedBy: "$userDetailsBy.userName",
          _id:0
        },
      },
      {
        $skip: (page - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
    ])

    if (!userPassUpdateHistroy) {
      return res
        .status(200)
        .json({ status: true, message: "No data found!" });
    }


    return res.status(200).json({
        status :true,
        currentPage:page,
        pageSize:pageSize,
        remainingPages: remainingPages,
        totalPages: totalPages,
        pageItems:userPassUpdateHistroy,
    })

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error"+error,
    });
  }
});


// Common functions
// ------------------------------------------------------------


// Common function for data encryption
const encryptData = (data) => aes256.encrypt(process.env.AES256_KEY, data);

// Log password update history
const updateHistoryOfPassword = async (updatedOf, updatedBy) =>{
  try {
    const passwordLog = new PassowordHistory;
    passwordLog.updatedOf = updatedOf
    passwordLog.updatedBy = updatedBy
    passwordLog.save()
    return true
  } catch (error) {
    return false
  }
}

module.exports = routes;
