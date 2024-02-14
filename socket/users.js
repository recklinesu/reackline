const {Server} = require("socket.io")

const socketFunc = (app)=>{
    io = new Server()
    io.use(app)


    io.on("connection", (socket)=>{
        console.log("User connnected");

        socket.on("disconnect", ()=>{
            console.log("User Disconnected");
        })
    })
    
}

module.exports = socketFunc