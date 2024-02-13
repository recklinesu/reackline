const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const aes256 = require("aes256");
const Users = require("../models/user");
const PassowordHistory = require("../models/passwordHistory");
const Roles = require("../models/roles");
const jwtVerify = require("../middleware/jwtAuth");
const domainCheck = require("../middleware/domainCheck");
const PermissionCheck = require("../GlobalFunctions/permissioncheck");
const UserDetails = require("../GlobalFunctions/userDetails")
const CanCreate = require("../GlobalFunctions/canCreate");
const masterCheck = require("../GlobalFunctions/masterCheck");
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

const validatePasswordMatch = (value, data) => {
  if (!value) {
    throw new Error("The " + data.path + " cannot be empty");
  } else if (value !== data.req.body.newPassword) {
    throw new Error("The " + data.path + " doesn't match with newPassword.");
  } else return true;
};

const validateRolelExists = async (value) => {
  const existsRole = await Roles.findById(new mongoose.Types.ObjectId(value));
  if (!existsRole) {
    throw new Error("Invalid role Id");
  }
};

// Sign up route
routes.post(
  "/signup",
  [jwtVerify],
  [
    body("name").optional().isString(),
    body("currency").optional().isString(),
    body("userName").isString().notEmpty().custom(validateUserNameExists),
    body("commission").optional().isNumeric(),
    body("openingBalance").optional().isNumeric(),
    body("creditReference").optional().isNumeric(),
    body("mobile").optional().isNumeric(),
    body("exposureLimit").optional().isNumeric(),
    body("partnership").optional().isNumeric(),
    body("password").isString().notEmpty().custom(validatePasswordLength),
    body("role").custom(validateRolelExists),
    body("domain").isString().notEmpty(),
    body("masterPassword").isString().notEmpty().custom(validatePasswordLength),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
        errors: errors.array(),
      });
    }

    try {

      const masterChecked = await masterCheck(req.user._id,req.body.masterPassword)

      if(!masterChecked){
        return res.status(401).send({
          status: false,
          message: "Invalid master password!",
        });
      }

      let userCreatPermission = await CanCreate(req.user._id, req.body.role);

      if (!userCreatPermission) {
        return res.status(401).send({
          status: false,
          message: "You can't create this user, Not allowed!",
        });
      }

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
        partnership,
        currency
      } = req.body;

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
        partnership,
        currency,
        password: hashedPassword,
        role,
        domain,
        createdBy: req.user._id,
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
        message: "Internal server error"+error,
      });
    }
  }
);

// Sign in route
routes.post(
  "/signin",
  [domainCheck],
  [
    body("password").custom(validatePasswordLength),
    body("userName").isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
        errors: errors.array(),
      });
    }

    try {

      let user = await Users.findOne({
        userName: req.body.userName,
        domain: new mongoose.Types.ObjectId(req.domainId)
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
          message: "This user's profile is " + user.status,
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

      return res.status(200).json({
        status: true,
        message: "User has been logged in successfully!",
        userToken: userToken,
        user: await UserDetails(user._id),
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
routes.get("/users/:page?/:pageSize?", [jwtVerify], async (req, res) => {

  try {

    const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;
    const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

    const totalDocuments = await Users.countDocuments({createdBy: new mongoose.Types.ObjectId(req.user._id)});

    const remainingPages = Math.ceil(
      (totalDocuments - (page - 1) * pageSize) / pageSize
    );

    const totalPages = Math.ceil(totalDocuments / pageSize);

    const users = await Users.find({createdBy: new mongoose.Types.ObjectId(req.user._id)}).populate(["role"]).populate("domain", "_id title host").sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize)

    if(!users.length){
      return res.status(200).json({
        status: true,
        message: "No data found!"
      })
    }else{
      return res.status(200).json({
        status: true,
        message: "Users fetched successfully!",
        currentPage: page,
        pageSize: pageSize,
        itemCount: users.length,
        totalPages: totalPages,
        pageItems:users
      })
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error" + error,
    });
  }
});

// Get deleted users route with JWT verification
routes.get("/deleted-users/:page?/:pageSize?", [jwtVerify], async (req, res) => {

  try {

    const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;
    const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

    const totalDocuments = await Users.collection.countDocuments({createdBy: new mongoose.Types.ObjectId(req.user._id), deleted: true});

    const remainingPages = Math.ceil(
      (totalDocuments - (page - 1) * pageSize) / pageSize
    );

    const totalPages = Math.ceil(totalDocuments / pageSize);

    const users = await Users.collection.find({ createdBy: new mongoose.Types.ObjectId(req.user._id), deleted: true })
    .project({ deleted: 0, deletedAt:0 })
    .sort({ deletedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

    if(!users.length){
      return res.status(200).json({
        status: true,
        message: "No data found!"
      })
    }else{
      return res.status(200).json({
        status: true,
        message: "Deleted Users fetched successfully!",
        currentPage: page,
        pageSize: pageSize,
        itemCount: users.length,
        totalPages: totalPages,
        pageItems:users
      })
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error" + error,
    });
  }
});


// delete users route with JWT verification
routes.post("/delete-user/:userId?", [jwtVerify], [
  body("masterPassword").isString().notEmpty().custom(validatePasswordLength),
],async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({
      status: false,
      message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
      errors: errors.array(),
      });
  }

  try{

    if(!mongoose.Types.ObjectId.isValid(req.params.userId)){
      return res.status(400).json({
        status: false,
        message: "Please provide a valid User ID."
      })
    }

    const checkPermission = await PermissionCheck(req.user._id, req.params.userId);

    if (!checkPermission) {
      return res.status(401).json({
        status: false,
        message: "You don't have permission to perform this action",
      });
    }

    const masterChecked = await masterCheck(req.user._id,req.body.masterPassword)

    if(!masterChecked){
      return res.status(401).send({
        status: false,
        message: "Invalid master password!",
      });
    }

    const  user = await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.userId), {deleted: true, deletedAt: new Date()});

    if(user){
      return res.status(200).json({
        status: true,
        message: "User has been deleted successfully!",
      })
    }else{
      return res.status(401).json({
        status: true,
        message: "Somthing went wrong!",
      })
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error" + error,
    });
  }
});

// restore users route with JWT verification
routes.post("/restore-user/:userId?", [jwtVerify], [
  body("masterPassword").isString().notEmpty().custom(validatePasswordLength),
],async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({
      status: false,
      message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
      errors: errors.array(),
      });
  }

  try{

    if(!mongoose.Types.ObjectId.isValid(req.params.userId)){
      return res.status(400).json({
        status: false,
        message: "Please provide a valid User ID."
      })
    }

    const checkPermission = await Users.collection.findOne({_id: new mongoose.Types.ObjectId(req.params.userId)})

    if (!checkPermission || !checkPermission.createdBy.equals(req.user._id)) {
      return res.status(401).json({
        status: false,
        message: "You don't have permission to perform this action",
      });
    }

    const masterChecked = await masterCheck(req.user._id,req.body.masterPassword)

    if(!masterChecked){
      return res.status(401).send({
        status: false,
        message: "Invalid master password!",
      });
    }

    const user = await Users.collection.findOneAndUpdate({_id: new mongoose.Types.ObjectId(req.params.userId)}, { $set: { deleted: false } }, { returnOriginal: false });

    if(user){
      return res.status(200).json({
        status: true,
        message: "User has been restored successfully!",
      })
    }else{
      return res.status(401).json({
        status: true,
        message: "Somthing went wrong!",
      })
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error" + error,
    });
  }
});


// Get users by userId
routes.get("/users-by-userid/:userId/:page?/:pageSize?", jwtVerify, async (req, res) => {

  try {

    if(!mongoose.Types.ObjectId.isValid(req.params.userId)){
      return res.status(400).json({
        status: false,
        message: "Please provide a valid User ID."
      })
    }

    const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;
    const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

    const totalDocuments = await Users.countDocuments({createdBy: new mongoose.Types.ObjectId(req.params.userId)});

    const remainingPages = Math.ceil(
      (totalDocuments - (page - 1) * pageSize) / pageSize
    );

    const totalPages = Math.ceil(totalDocuments / pageSize);

    const users = await Users.find({createdBy: new mongoose.Types.ObjectId(req.params.userId)}).populate(["role"]).populate("domain", "_id title host").sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize)

    if(!users.length){
      return res.status(200).json({
        status: true,
        message: "No data found!"
      })
    }else{
      return res.status(200).json({
        status: true,
        message: "Users fetched successfully!",
        currentPage: page,
        pageSize: pageSize,
        itemCount: users.length,
        totalPages: totalPages,
        pageItems:users
      })
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error" + error,
    });
  }
});

// Get users by status
routes.get("/users-by-status/:status/:page?/:pageSize?", jwtVerify, async (req, res) => {

  try {

    const checkParams = (value)=>{
      if (value === "active" || value === "suspend" || value === "locked") {
        return true;
      } else {
        return false
      }
    }

    if(!checkParams(req.params.status)){
      return res.status(400).json({
        status: false,
        message: "The status could be either 'active', 'suspend' or 'locked'"
      })
    }

    const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;
    const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

    const totalDocuments = await Users.countDocuments({createdBy: new mongoose.Types.ObjectId(req.user._id), status: req.params.status});

    const remainingPages = Math.ceil(
      (totalDocuments - (page - 1) * pageSize) / pageSize
    );

    const totalPages = Math.ceil(totalDocuments / pageSize);

    const users = await Users.find({createdBy: new mongoose.Types.ObjectId(req.user._id), status: req.params.status}).populate(["role"]).populate("domain", "_id title host").sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize)

    if(!users.length){
      return res.status(200).json({
        status: true,
        message: "No data found!"
      })
    }else{
      return res.status(200).json({
        status: true,
        message: "Users fetched successfully!",
        currentPage: page,
        pageSize: pageSize,
        itemCount: users.length,
        totalPages: totalPages,
        pageItems:users
      })
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error" + error,
    });
  }
});

// Get users by role
routes.get("/users-by-role/:roleId/:page?/:pageSize?", jwtVerify, async (req, res) => {

  try {

    const checkRole = await Roles.findOne(new mongoose.Types.ObjectId(req.params.roleId))

    if(!checkRole){
      return res.status(400).json({
        status: false,
        message: "Invalid Role ID!"
      })
    }

    const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;
    const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

    const totalDocuments = await Users.countDocuments({createdBy: new mongoose.Types.ObjectId(req.user._id), role: new mongoose.Types.ObjectId(req.params.roleId)});

    const remainingPages = Math.ceil(
      (totalDocuments - (page - 1) * pageSize) / pageSize
    );

    const totalPages = Math.ceil(totalDocuments / pageSize);

    const users = await Users.find({createdBy: new mongoose.Types.ObjectId(req.user._id), role: new mongoose.Types.ObjectId(req.params.roleId)}).populate(["role"]).populate("domain", "_id title host").sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize)

    if(!users.length){
      return res.status(200).json({
        status: true,
        message: "No data found!"
      })
    }else{
      return res.status(200).json({
        status: true,
        message: "Users fetched successfully!",
        currentPage: page,
        pageSize: pageSize,
        itemCount: users.length,
        totalPages: totalPages,
        pageItems:users
      })
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error" + error,
    });
  }
});

// update user's password route with JWT verification
routes.post(
  "/update-password/:userId?",
  [jwtVerify],
  [
    body("currentPassword").custom(validatePasswordLength),
    body("newPassword").custom(validatePasswordLength),
    body("confirmPassword").custom(validatePasswordMatch),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
        errors: errors.array(),
      });
    }

    try {
      let userId = req.params.userId;

      if (userId) {
        let checkPermission = await PermissionCheck(req.user._id, userId);

        if (!checkPermission) {
          return res.status(401).json({
            status: false,
            message: "You don't have permission to perform this action",
          });
        }
      }

      const isMatched = await bcrypt.compare(
        req.body.currentPassword,
        req.user.password
      );

      if (!isMatched) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid password!" });
      }

      const passwordSalt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(
        req.body.confirmPassword,
        passwordSalt
      );

      let userPasswordUpdated = null;

      if (userId) {
        userPasswordUpdated = await Users.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(userId) },
          { password: hashedPassword }
        );
      } else {
        userPasswordUpdated = await Users.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(req.user._id) },
          { password: hashedPassword }
        );
      }

      if (!userPasswordUpdated) {
        return res
          .status(401)
          .json({ status: false, message: "Something went wrong!" });
      }

      if (userId) {
        if (!updateHistoryOfPassword(userId, req.user._id)) {
          console.log(
            `Failed to add history of the updated password for ${req.userName}`
          );
        }
      } else {
        if (!updateHistoryOfPassword(req.user._id, req.user._id)) {
          console.log(
            `Failed to add history of the updated password for ${req.userName}`
          );
        }
      }

      return res.status(200).json({
        status: true,
        message: "Password has been updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Internal server error" + error,
      });
    }
  }
);

// update users route with JWT verification
routes.post(
  "/update-user/:userId?",
  [
    body("name")
      .optional()
      .isLength({ min: 3 })
      .isString()
      .withMessage("Please provide a valid name"),
    body("currency")
      .optional()
      .isString()
      .withMessage("Please provide a valid currency"),
    body("commission")
      .optional()
      .isNumeric()
      .withMessage("Commission can be only typeOf numeric value"),
    body("openingBalance")
      .optional()
      .isNumeric()
      .withMessage("Commission can be only typeOf numeric value"),
    body("creditReference")
      .optional()
      .isNumeric()
      .withMessage("Commission can be only typeOf numeric value"),
    body("partnership")
      .optional()
      .isNumeric()
      .withMessage("Partnership can be only typeOf numeric value"),
    body("exposureLimit")
      .optional()
      .isNumeric()
      .withMessage("Commission can be only typeOf numeric value"),
    body("mobile")
      .optional()
      .isNumeric()
      .isLength({ min: 10 })
      .withMessage("Commission can be only typeOf numeric value"),
    body("role").optional().custom(validateRolelExists),
    body("status")
      .optional()
      .custom((value) => {
        if (value === "active" || value === "suspend" || value === "locked") {
          return true;
        } else {
          throw new Error(
            "The status could be either 'active', 'suspend' or 'locked'"
          );
        }
      }),
      body("masterPassword").isString().notEmpty().custom(validatePasswordLength),
  ],
  [jwtVerify],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
        errors: errors.array(),
      });
    }

    try {

      const masterChecked = await masterCheck(req.user._id,req.body.masterPassword)

      if(!masterChecked){
        return res.status(401).send({
          status: false,
          message: "Invalid master password!",
        });
      }

      const body = {
        name: req.body.name,
        commission: req.body.commission,
        openingBalance: req.body.openingBalance,
        creditReference: req.body.creditReference,
        mobile: req.body.mobile,
        exposureLimit: req.body.exposureLimit,
        role: req.body.role,
        currency: req.body.currency,
        partnership: req.body.partnership,
        status: req.body.status,
      };

      if (req.params.userId) {
        const checkPermission = await PermissionCheck(
          req.user._id,
          req.params.userId
        );
        if (!checkPermission) {
          return res.status(401).json({
            status: false,
            message: "You don't have permission to perform this action!",
          });
        }
      }

      let updatedUserDetails = null;

      if (req.params.userId) {
        updatedUserDetails = await Users.findByIdAndUpdate(
          new mongoose.Types.ObjectId(req.params.userId),
          body
        );
      } else {
        updatedUserDetails = await Users.findByIdAndUpdate(
          new mongoose.Types.ObjectId(req.user_id),
          body
        );
      }

      if (!updatedUserDetails) {
        return res.status(400).json({
          status: false,
          message: "somthing went wring",
        });
      }

      return res.status(500).json({
        status: true,
        message: "User details has been updated successfully!",
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Internal server error" + error,
      });
    }
  }
);

// get password update history route with JWT verification
routes.get(
  "/password-update-history/:page?/:pageSize?",
  [jwtVerify],
  async (req, res) => {
    try {
      const page = req.params.page
        ? parseInt(req.params.page) < 1
          ? 1
          : parseInt(req.params.page)
        : 1;
      const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;

      const totalDocuments = await PassowordHistory.countDocuments({
        updatedOf: req.user._id,
      });

      const remainingPages = Math.ceil(
        (totalDocuments - (page - 1) * pageSize) / pageSize
      );

      const totalPages = Math.ceil(totalDocuments / pageSize);

      const userPassUpdateHistroy = await PassowordHistory.aggregate([
        {
          $match: {
            updatedOf: new mongoose.Types.ObjectId(req.user._id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updatedBy",
            foreignField: "_id",
            as: "userDetailsBy",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updatedOf",
            foreignField: "_id",
            as: "userDetailsOf",
          },
        },
        {
          $project: {
            createdAt: "$createdAT",
            updatedOf: "$userDetailsOf.userName",
            updatedBy: "$userDetailsBy.userName",
            _id: 0,
          },
        },
        {
          $sort: { createdAt: -1 } // Sorting by createdAt field in descending order
        },
        {
          $skip: (page - 1) * pageSize,
        },
        {
          $limit: pageSize,
        },
      ]);

      if (!userPassUpdateHistroy.length) {
        return res
          .status(200)
          .json({ status: true, message: "No data found!" });
      }

      return res.status(200).json({
        status: true,
        message: "Password histories fetched successfully!",
        currentPage: page,
        pageSize: pageSize,
        itemCount: userPassUpdateHistroy.length,
        totalPages: totalPages,
        pageItems: userPassUpdateHistroy,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Internal server error" + error,
      });
    }
  }
);

// get my details
routes.get("/letest-user-details", [jwtVerify], async(req,res)=>{
  try {
    const user = await UserDetails(req.user._id)

    return res.status(200).json({
      status:true,
      message: "User's letest details fetched successfully!",
      user
    })

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error" + error,
    });
  }
})

// Common functions
// ------------------------------------------------------------

// Common function for data encryption
const encryptData = (data) => aes256.encrypt(process.env.AES256_KEY, data);

// Log password update history
const updateHistoryOfPassword = async (updatedOf, updatedBy) => {
  try {
    const passwordLog = new PassowordHistory();
    passwordLog.updatedOf = updatedOf;
    passwordLog.updatedBy = updatedBy;
    passwordLog.save();
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = routes;
