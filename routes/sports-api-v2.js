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
                body
            }); 
            // console.error("Error:", error);
            // res.status(response.statusCode).send("Error fetching data");
        }
    });
});

// Fetch events
routes.get("/fetch-events", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v2/getSport";

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

        const api = process.env.APP_SPORTS_URL+"api/v2/fetch_data?Action=listCompetitions&EventTypeID="+req.params.event_id;

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

        const api = process.env.APP_SPORTS_URL+"api/v2/fetch_data?Action=listEvents&EventTypeID="+req.params.event_id+"&CompetitionID="+req.params.compation_id;

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
routes.get("/fetch-score/:event_id/:match_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v2/score?EventTypeID="+req.params.event_id+"&matchId="+req.params.match_id;

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
routes.get("/fetch-markets/:event_id/:match_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v2/getMarkets?EventTypeID="+req.params.event_id+"&EventID="+req.params.match_id;

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
// routes.get("/fetch-market-runner/:market_id", [headerVerify], (req, res) => {
//     try {

//         const api = process.env.APP_SPORTS_URL+"api/v1/fetch_data?Action=listMarketRunner&MarketID="+req.params.market_id;

//         request.get({
//             url: api,
//             forever: false
//         }, function(error, response, body) {
//             if (!error && response.statusCode === 200) {
//                 res.status(200).json({
//                     status: true,
//                     message: "Data has been fetched successfully!",
//                     data: JSON.parse(body)
//                 });
//             } else {
//                 res.status(500).json({
//                     status: false,
//                     message: "Internal error!"
//                 }); 
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             message: "Internal error!"
//         }); 
//     }
// });

// Fetch market odds of market
routes.get("/fetch-market-odds/:evennt_id/:market_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v2/getMarketsOdds?EventTypeID="+req.params.event_id+"&marketId="+req.params.market_id;

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
routes.get("/fetch-market-session/:event_id/:match_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v2/getSessions?EventTypeID="+req.params.event_id+"&matchId="+req.params.match_id;

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

// Fetch bookmarker of market
routes.get("/fetch-bookmarker/:event_id/:matche_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v2/getBookmakers?EventTypeID="+req.params.market_id+"&EventID=33068371"+req.params.match_id;

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

// Fetch bookmarker odds of market
routes.get("/fetch-bookmarker-odds/:evennt_id/:market_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL+"api/v2/getBookmakerOdds?EventTypeID="+req.params.event_id+"&marketId="+req.params.market_id;

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