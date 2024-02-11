const express = require("express")
const { body, validationResult, check } = require("express-validator");
const Roles = require("../models/roles");
const jwtVerify = require("../middleware/jwtAuth");
const routePermissions = require("../GlobalFunctions/routePermission");
require("dotenv").config();

const routes = express.Router();

routes.post("/create-new-role", jwtVerify,[
    body("name").isLength({min:3}).custom(async (e)=>{
        const role = await Roles.findOne({name: e})
        console.log(role);
        if (role) throw new Error('Role already exists');
    }),
], async(req,res)=>{

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
        status: false,
        message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
        errors: errors.array(),
        });
    }

    try {

        const checkPermission = await routePermissions(req.user._id, ["Watcher"])

        if(!checkPermission){
            return res.status(500).json({
                status: false,
                message: "This user is not allowed for the following task.",
            });
        }
        
        const roles = await Roles.create({
            name:req.body.name,
            canWatcher:req.body.canWatcher??false,
            canDeclare:req.body.canDeclare??false,
            canCreater:req.body.canCreater??false,
            canWhiteLabel:req.body.canWhiteLabel??false,
            canSuper:req.body.canSuper??false,
            canMaster:req.body.canMaster??false,
            canAgent:req.body.canAgent??false,
            canUser:req.body.canUser??false,
        })

        return res.status(200).json({
            status: true,
            message: "New role has been created successfully successfully!",
            roles
        });
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error : "+error,
        });
    }

});

routes.get("/get-roles/:roleName?", jwtVerify, async (req, res) =>{
    try {

        // const allowedRolesList = await routePermissions(req.user._id,["Watcher","Declare","Declare","WhiteLabel","Super","Master","Agent","User"]);

        // if(!allowedRolesList){
        //     return res.status(500).json({
        //         status: false,
        //         message: "This user is not allowed for the following task.",
        //     });
        // }

        let roles = null

        if(req.params.roleName){
            roles = await Roles.find({name: req.params.roleName});
        }else{
            roles = await Roles.find();
        }

        if(!roles){
            return res.status(404).json({
                status:false,
                message:"No data found."
            })
        }


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

routes.post("/update-role-permissions", jwtVerify,[
    body("roleId").notEmpty(),
    body("canWatcher").isBoolean().withMessage("This value either could be 'true' or 'false'"),
    body("canDeclare").isBoolean().withMessage("This value either could be 'true' or 'false'"),
    body("canCreater").isBoolean().withMessage("This value either could be 'true' or 'false'"),
    body("canWhiteLabel").isBoolean().withMessage("This value either could be 'true' or 'false'"),
    body("canSuper").isBoolean().withMessage("This value either could be 'true' or 'false'"),
    body("canMaster").isBoolean().withMessage("This value either could be 'true' or 'false'"),
    body("canAgent").isBoolean().withMessage("This value either could be 'true' or 'false'"),
    body("canUser").isBoolean().withMessage("This value either could be 'true' or 'false'"),
], async(req,res)=>{

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
        status: false,
        message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
        errors: errors.array(),
        });
    }

    try {

        const checkPermission = await routePermissions(req.user._id, ["Watcher"])

        if(!checkPermission){
            return res.status(500).json({
                status: false,
                message: "This user is not allowed for the following task.",
            });
        }


        const role = await Roles.findById(req.body.roleId)

        if(!role){
            return res.status(500).json({
                status: false,
                message: "Invalid Role Id!",
            });
        }

        const roleUpdated = await Roles.findOneAndUpdate({ _id: req.body.roleId }, { 
            canWatcher: req.body.canWatcher,
            canDeclare: req.body.canDeclare,
            canCreater: req.body.canCreater,
            canWhiteLabel: req.body.canWhiteLabel,
            canSuper: req.body.canSuper,
            canMaster: req.body.canMaster,
            canAgent: req.body.canAgent,
            canUser: req.body.canUser,
         });

        if(!roleUpdated){
            return res.status(500).json({
                status: false,
                message: "Somthing went wrong!",
            });
        }

        return res.status(500).json({
            status: true,
            message: "Roles has been updated successfully!",
            preview: await Roles.findById(req.body.roleId).select(["-_id","-__v"])
        });
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"+error,
        });
    }

});

module.exports = routes