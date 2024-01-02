const mongoose = require("mongoose")
require("dotenv").config()

const connectToMongo = () =>{

    mongoose.connect(process.env.APP_DATABASE_URL)

    const database = mongoose.connection

    database.on("error", (err)=>{
        console.log(err);
    })

    database.once("connected", ()=>{
        console.log("Database is connected successfully!");
    })

}

module.exports = connectToMongo