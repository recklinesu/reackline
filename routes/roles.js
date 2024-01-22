const express = require("express")
const { body, validationResult } = require("express-validator");
const Roles = require("../models/roles")
require("dotenv").config();

const routes = express.Router();

routes.post("/create-new-role", [
    body("name").isLength({min:3}),
], async(req,res)=>{

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
        status: false,
        message: "Validation failed!",
        errors: errors.array(),
        });
    }

    try {
        const roles = await Roles.create({
            name:req.body.name,
            canWatcher:req.body.canWatcher,
            canDeclare:req.body.canDeclare,
            canCreater:req.body.canCreater,
            canWhiteLabel:req.body.canWhiteLabel,
            canSuper:req.body.canSuper,
            canMaster:req.body.canMaster,
            canAgent:req.body.canAgent,
            canUser:req.body.canUser,
        })

        return res.status(200).json({
            status: true,
            message: "New role has been created successfully successfully!",
            roles
        });
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"+error,
        });
    }

});

routes.get("/get-roles",async (req, res) =>{
    try {
        const roles = await Roles.find();

        return res.status(200).json({
            status: true,
            roles
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"+error,
        });
    }
})

module.exports = routes