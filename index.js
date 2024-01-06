const express = require('express')
const connectToMongo = require("./database")
const app = express();
const port = 5000;

app.use(express.json());

connectToMongo();


// Routes
app.use('', require('./routes/auth'))
app.set('view engine','ejs');



app.listen(port, (req, res)=>{
    console.log(`App is listening on post ${port}`);
})