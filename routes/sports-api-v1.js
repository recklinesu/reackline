const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const request = require('request');
const jwtVerify = require("../middleware/jwtAuth");
const suspendVerify = require("../middleware/jwtAuth");
const headerVerify = require("../middleware/headerAuth");
const ApiOrigins = require("../models/apiOrigin");
const routePermissions = require("../GlobalFunctions/routePermission");

require("dotenv").config();

const routes = express.Router();

// Create  a new API Origin
routes.post("/create-origin", [jwtVerify, suspendVerify], [
    body("api").notEmpty().custom(async (e)=>{
        const check = await ApiOrigins.findOne({api: e})
        if(check){
            throw new Error("Origin already exists")
        } 
    })
], async (req, res)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
          status: false,
          message: errors.array()[0]['path']+" : "+errors.array()[0]['msg'],
          errors: errors.array(),
        });
      }

      try {
        const routePermission = await routePermissions(req.user._id, ["Watcher"])

        if(!routePermission){
            return res.status(401).json({
                status: false,
                message: "This user is not allowed for the following task.",
            });
      }

        const api = req.body.api;
        const api1 = "http://"+req.body.api;
        const api2 = "https://"+req.body.api;

        const saveOrigin = await ApiOrigins.create({
            api:api,
            api1:api1,
            api2:api2
        })

        res.status(200).json({
            status: true,
            message: "API origin has been created successfully!",
            origin: saveOrigin
        })

      } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
      }
})

// Get all origin APIs of a User
routes.get("/get-origin/:page?/:pageSize?", [jwtVerify], async (req, res)=>{
    try {
        const page = req.params.page
          ? parseInt(req.params.page) < 1
            ? 1
            : parseInt(req.params.page)
          : 1;
        const pageSize = req.params.pageSize ? parseInt(req.params.pageSize) : 10;
  
        const totalDocuments = await ApiOrigins.countDocuments();
  
        const remainingPages = Math.ceil(
          (totalDocuments - (page - 1) * pageSize) / pageSize
        );
  
        const totalPages = Math.ceil(totalDocuments / pageSize);
  
        const allOrigins = await ApiOrigins.aggregate([
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
  
        if (!allOrigins.length) {
          return res
            .status(200)
            .json({ status: true, message: "No data found!" });
        }
  
        return res.status(200).json({
          status: true,
          message: "Api Origins have been fetched successfully!",
          currentPage: page,
          pageSize: pageSize,
          itemCount: allOrigins.length,
          totalPages: totalPages,
          pageItems: allOrigins,
        });
      } catch (error) {
        return res.status(500).json({
          status: false,
          message: "Internal server error" + error,
        });
      }
})

// Delete Origin
routes.post("/delete-origin/:originId", [jwtVerify, suspendVerify], async (req, res)=>{
    try {

        const routePermission = await routePermissions(req.user._id, ["Watcher"])

        if(!routePermission){
            return res.status(401).json({
                status: false,
                message: "This user is not allowed for the following task.",
            });
      }

        if(!mongoose.Types.ObjectId.isValid(req.params.originId)){
            return res.status(400).json({
              status: false,
              message: "Please provide a valid Origin ID."
            })
          }

          if(!await ApiOrigins.findById(new mongoose.Types.ObjectId(req.params.originId))){
            return res.status(400).json({
                status: false,
                message: "Please provide a valid Origin ID."
              })
          }
    
          const deleteOrigin = await ApiOrigins.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.originId))

          if(!deleteOrigin){
            return res.status(403).json({
                status: true,
                message: "Somthing went wrong"
              })
          }
    
          return res.status(200).json({
            status: true,
            message: "Following origin has been deleted successfully!"
          })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"+error
        }); 
    }
})

// Hits external apis
routes.get("/get-data", [jwtVerify], async (req, res) => {
    request.get({
        url: req.body.api,
        forever: false
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            // console.log(body);
            let data = JSON.parse(body);
            res.status(200).json({
                status:true,
                message: "Data have been fetched successfully!",
                data: data
            });
        } else {
            res.status(500).json({
                status: false,
                message: "Something went wrong! Please try again later.",
            }); 
            // console.error("Error:", error);
            // res.status(response.statusCode).send("Error fetching data");
        }
    });
});

// Fetch events
routes.get("/fetch-events", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v1/fetch_data?Action=listEventTypes";

        request.get({
            url: api,
            forever: false
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "Internal error!"
                }); 
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
    }
});


// Fetch compatitions as per event
routes.get("/fetch-compatitions/:event_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v1/fetch_data?Action=listCompetitions&EventTypeID="+req.params.event_id;

        request.get({
            url: api,
            forever: false
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "Internal error!"
                }); 
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
    }
});

// Fetch matches via event as compatition id
routes.get("/fetch-matches/:event_id/:compation_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v1/fetch_data?Action=listEvents&EventTypeID="+req.params.event_id+"&CompetitionID="+req.params.compation_id;

        request.get({
            url: api,
            forever: false
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "Internal error!"
                }); 
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
    }
});

// Fetch matches scores via match ids
routes.get("/fetch-score/:match_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v1/score?match_id="+req.params.match_id;

        request.get({
            url: api,
            forever: false
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "Internal error!"
                }); 
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
    }
});

// Fetch market of match ids
routes.get("/fetch-markets/:match_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v1/fetch_data?Action=listMarketTypes&EventID="+req.params.match_id;

        request.get({
            url: api,
            forever: false
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "Internal error!"
                }); 
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
    }
});

// Fetch market run of market
routes.get("/fetch-market-runner/:market_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v1/fetch_data?Action=listMarketRunner&MarketID="+req.params.market_id;

        request.get({
            url: api,
            forever: false
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "Internal error!"
                }); 
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
    }
});

// Fetch market odds of market
routes.get("/fetch-market-odds/:market_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v1/listMarketBookOdds?market_id="+req.params.market_id;

        request.get({
            url: api,
            forever: false
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "Internal error!"
                }); 
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
    }
});

// Fetch market session of market
routes.get("/fetch-market-session/:market_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v1/listMarketBookSession?match_id="+req.params.market_id;

        request.get({
            url: api,
            forever: false
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "Internal error!"
                }); 
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal error!"
        }); 
    }
});

module.exports = routes