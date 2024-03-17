const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const request = require('request');
const axios = require("axios");
const jwtVerify = require("../middleware/jwtAuth");
const suspendVerify = require("../middleware/jwtAuth");
const headerVerify = require("../middleware/headerAuth");
const ApiOrigins = require("../models/apiOrigin");
const Sports = require("../models/sports/sports")
const routePermissions = require("../GlobalFunctions/routePermission");

require("dotenv").config();

const routes = express.Router();

// Hits external apis
routes.get("/get-data", [headerVerify], async (req, res) => {
    request.get({
        url: req.body.api,
        forever: false
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // console.log(body);
            let data = JSON.parse(body);
            res.status(200).json({
                status: true,
                message: "Data have been fetched successfully!",
                data: JSON.parse(body)
            });
        } else {
            res.status(400).json({
                status: false,
                message: "Something went wrong! Please try again later.",
                body: JSON.parse(body),
            });
            // console.error("Error:", error);
            // res.status(response.statusCode).send("Error fetching data");
        }
    });
});

// Fetch events
routes.get("/fetch-events", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL + "api/v2/getSport";

        request.get({
            url: api,
            forever: false
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "Something went wrong! Please try again later.",
                    body: JSON.parse(body),
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

        const api = process.env.APP_SPORTS_URL + "api/v2/fetch_data?Action=listCompetitions&EventTypeID=" + req.params.event_id;

        request.get({
            url: api,
            forever: false
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "Something went wrong! Please try again later.",
                    body: JSON.parse(body),
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

        const api = process.env.APP_SPORTS_URL + "api/v2/fetch_data?Action=listEvents&EventTypeID=" + req.params.event_id + "&CompetitionID=" + req.params.compation_id;

        request.get({
            url: api,
            forever: false
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "Something went wrong! Please try again later.",
                    body: JSON.parse(body),
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

        const api = process.env.APP_SPORTS_URL + "api/v2/score?EventTypeID=" + req.params.event_id + "&matchId=" + req.params.match_id;

        request.get({
            url: api,
            forever: false
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "Something went wrong! Please try again later.",
                    body: JSON.parse(body),
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

        const api = process.env.APP_SPORTS_URL + "api/v2/getMarkets?EventTypeID=" + req.params.event_id + "&EventID=" + req.params.match_id;

        request.get({
            url: api,
            forever: false
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "Something went wrong! Please try again later.",
                    body: JSON.parse(body),
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
routes.get("/fetch-market-odds/:event_id/:market_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL + "api/v2/getMarketsOdds?EventTypeID=" + req.params.event_id + "&marketId=" + req.params.market_id;

        request.get({
            url: api,
            forever: false
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "Something went wrong! Please try again later.",
                    body: JSON.parse(body),
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

        const api = process.env.APP_SPORTS_URL + "api/v2/getSessions?EventTypeID=" + req.params.event_id + "&matchId=" + req.params.match_id;

        request.get({
            url: api,
            forever: false
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "Something went wrong! Please try again later.",
                    body: JSON.parse(body),
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
routes.get("/fetch-bookmarker/:event_id/:match_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL + "api/v2/getBookmakers?EventTypeID=" + req.params.event_id + "&EventID=" + req.params.match_id;

        request.get({
            url: api,
            forever: false
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "Something went wrong! Please try again later.",
                    body: JSON.parse(body),
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
routes.get("/fetch-bookmarker-odds/:event_id/:market_id", [headerVerify], (req, res) => {
    try {

        const api = process.env.APP_SPORTS_URL + "api/v2/getBookmakerOdds?EventTypeID=" + req.params.event_id + "&marketId=" + req.params.market_id;

        request.get({
            url: api,
            forever: false
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.status(200).json({
                    status: true,
                    message: "Data has been fetched successfully!",
                    data: JSON.parse(body)
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "Something went wrong! Please try again later.",
                    body: JSON.parse(body),
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

routes.get("/update-sports", [headerVerify], async (req, res) => {
    try {
        // Delete
        await Sports.deleteMany();
        const events = await FetchEvents();
        const legues = await FetchLegues(events);
        const matches = await FetchMatches(legues.legueArray);
        const saveSports = await Sports({ event: events, legues: legues.legue, matches: matches.matchArray });
        await saveSports.save()
        // send 
        res.status(200).json({
            status: true,
            message: "Done",
            matches: matches.matchArray
        })
        // res.status(200).json(legues)
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "error",
            error: error
        })
    }
})

const FetchEvents = async () => {
    const api = "https://api.recklinesports.com/api/v2/fetch-events";
    const response = await axios.get(api, {
        headers: {
            Origin: "https://api.recklinesports.com/api/v2/fetch-events"
        }
    });
    return response.data.data;
};

const FetchLegues = async (events) => {
    const leguesData = {}; // Object to store leagues data for each event
    const legueArray = [];
    const legueWithKeys = {};

    // Fetch leagues data for each event concurrently
    await Promise.all(events.map(async (event) => {
        try {
            const api = "https://api.recklinesports.com/api/v2/fetch-compatitions/" + parseInt(event.eventType);
            const response = await axios.get(api, {
        headers: {
            Origin: "https://api.recklinesports.com/api/v2/fetch-events"
        }
    });
            legueWithKeys[event.eventType] = {eventType: event.eventType, legues: response.data.data}; // Store leagues data for this event
            await Promise.all(response.data.data.map(async (compete)=>{
                compete.eventType = event.eventType;
                legueArray.push(compete)
            }))
        } catch (error) {
            // leguesData[event.eventType] = {eventType: event.eventType, error: "No data"}; // Store placeholder data in case of error
        }
    }));

    leguesData["legue"] = legueWithKeys; // Return object containing leagues data for all events
    leguesData["legueArray"] = legueArray; // Return object containing leagues data for all events
    return leguesData
}

const FetchMatches = async (leagues) => {
    const leguesData = {}; // Object to store leagues data for each event
    const legueArray = [];
    const legueWithKeys = {};

    // Fetch leagues data for each event concurrently
    await Promise.all(leagues.map(async (event) => {
        try {
            const api = "https://api.recklinesports.com/api/v2/fetch-matches/" + parseInt(event.eventType) + "/" + parseInt(event.competition.id);
            const response = await axios.get(api, {
        headers: {
            Origin: "https://api.recklinesports.com/api/v2/fetch-events"
        }
    });
            legueWithKeys[event.eventType] = {eventType: event.eventType, competition: {id: event.competition.id,name: event.competition.name}, matches: response.data.data}; // Store leagues data for this event
            await Promise.all(response.data.data.map(async (compete)=>{
                compete.eventType = event.eventType;
                compete.competition = {id: event.competition.id,name: event.competition.name}
                compete.markets = await FetchMarkets(event.eventType, compete.event.id)
                legueArray.push(compete)
            }))
        } catch (error) {
            // leguesData[event.eventType] = {eventType: event.eventType, error: "No data"}; // Store placeholder data in case of error
        }
    }));

    leguesData["match"] = legueWithKeys; // Return object containing leagues data for all events
    leguesData["matchArray"] = legueArray; // Return object containing leagues data for all events
    return leguesData
}


const FetchMarkets = async (eventId, matchId) => {
    const dataG = [];
    const api = "https://api.recklinesports.com/api/v2/fetch-markets/" + parseInt(eventId) + "/" + parseInt(matchId);
    const response = await axios.get(api, {
        headers: {
            Origin: "https://api.recklinesports.com/api/v2/fetch-events"
        }
    });
    await Promise.all(response.data.data.map(async (data)=>{
        data.marketOdds = await FetchOdds(eventId,  data.marketId);
        dataG.push(data);
    }))
    return dataG;

}

const FetchOdds = async (eventId, marketId) => {
    const api = "https://api.recklinesports.com/api/v2/fetch-market-odds/" + parseInt(eventId) + "/" + parseFloat(marketId);
    const response = await axios.get(api, {
        headers: {
            Origin: "https://api.recklinesports.com/api/v2/fetch-events"
        }
    });
    return response.data.data;
}

module.exports = routes