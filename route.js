const path = require("path")
const routesInit = (app)=>{

    // Routes
    app.get("/", (req, res)=>{
      res.sendFile(path.join(__dirname, 'doc', 'index.html'));
    })

    // Serve Socket.IO client library
    app.get('/socket.io/socket.io.js', (req, res) => {
      res.sendFile(__dirname + 'node_modules/socket.io/client-dist/socket.io.js');
    });
  
    app.use("/api", require("./routes/domain"));
    app.use("/api/auth", require("./routes/auth"));
    app.use("/api/transit", require("./routes/transit"));
    app.use("/api/bet", require("./routes/Bet"));
    app.use("/api/settings", require("./routes/roles"));
    app.use("/api/v1/", require("./routes/sports-api-v1"));
    app.use("/api/v2/", require("./routes/sports-api-v2"));
    app.use("/api/1-5-B-S-P-C-F-S-0-0-5/", require("./routes/sports-api-v2-internal-perpose"));

}

module.exports = routesInit