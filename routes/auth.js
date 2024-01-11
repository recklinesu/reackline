const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const aes256 = require("aes256");
const Users = require("../models/user");
const jwtVerify = require("../middleware/jwtAuth");
// const { roles } = require("../staticData/roles");
require("dotenv").config();

const routes = express.Router();

// Validation middleware for common checks
const validateEmailExists = async (value) => {
  const existingUser = await Users.findOne({ email: value });
  if (existingUser) {
    throw new Error("This email address is already associated with a user.");
  }
};

// Validation middleware for password length
const validatePasswordLength = (value) => {
  if (!value) {
    throw new Error("Password cannot be empty.");
  } else if (value.length < 6) {
    throw new Error("The password must contain at least six characters.");
  }
  return true;
};

// Validation middleware for confirming passwords
const validateConfirmPassword = (value, { req }) => {
  if (!value) {
    throw new Error("Confirm Password cannot be empty.");
  } else if (value !== req.body.password) {
    throw new Error("Confirm Password doesn't match with the password!");
  }
  return true;
};

// Sign up route
routes.post(
  "/signup",
  [
    body("name").notEmpty().trim().withMessage("Name cannot be empty."),
    body("email")
      .isEmail()
      .trim()
      .withMessage("Please provide a valid email address.")
      .custom(validateEmailExists),
    body("password").custom(validatePasswordLength),
    body("cpassword").custom(validateConfirmPassword),
    // body("role")
    //   .isString()
    //   .isIn(roles.map((role) => role.name))
    //   .withMessage("Invalid role specified."),
  ],
  async (req, res) => {
    console.log(req.headers.host);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: "Validation failed!",
        errors: errors.array(),
      });
    }

    try {
      const passwordSalt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, passwordSalt);
      const { name, email, role } = req.body;
      const { host } = req.headers;
      const user = await Users.create({
        name: name,
        email: email,
        password: hashedPassword,
        // role: role,
        // domain: host,
      });

      const userData = {
        user_id: user._id,
      };

      const signedToken = jwt.sign(userData, process.env.JWT_KEY);
      return res.status(200).json({
        status: true,
        message: "User's account has been created successfully!",
        userToken: signedToken,
      });
    } catch (error) {
      console.error("Error during user creation:", error);
      return res.status(500).send({
        status: false,
        message: "Internal server error",
      });
    }
  }
);

// Sign in route
routes.post(
  "/signin",
  [
    body("email")
      .isEmail()
      .trim()
      .withMessage("Please provide a valid email address.")
      .custom(validateEmailExists),
    body("password").custom(validatePasswordLength),
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
      const user = await Users.findOne({ email: req.body.email });

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "This email address is not associated with any user.",
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
routes.get("/get-users", jwtVerify, (req, res) => {
  res.send(req.user);
});

// Common function for data encryption
const encryptData = (data) => aes256.encrypt(process.env.AES256_KEY, data);

module.exports = routes;
