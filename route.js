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
    app.use("/api/settings", require("./routes/roles"));
    app.use("/api/sports", require("./routes/sports-api"));

}

module.exports = routesInit