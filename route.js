const routesInit = (app)=>{

    // Routes
    app.get("/", (req, res)=>{
      res.send("Welcome to the Reckline API");
    })
  
    app.use("/api", require("./routes/domain"));
    app.use("/api/auth", require("./routes/auth"));
    app.use("/api/transit", require("./routes/transit"));
    app.use("/api/settings", require("./routes/roles"));

}

module.exports = routesInit