const express = require('express')
const connectToMongo = require("./database")
const app = express();
const port = 5000;

app.use(express.json());

connectToMongo();


// Routes
app.use('/api/auth', require('./routes/auth'))

app.listen(port, (req, res)=>{
    console.log(`App is listening on post ${port}`);
})