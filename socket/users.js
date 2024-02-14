// socketInit.js
const socketIO = require('socket.io');
const Users = require("../models/user");
const mongoose = require('mongoose');

function socketInit(server) {
    const io = socketIO(server, {
        cors: true
    });

    // Define event handlers
    io.on('connection', async (socket) => {
        
        if(mongoose.Types.ObjectId.isValid(socket.handshake.auth.userId)){
            await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(socket.handshake.auth.userId), {online: true})
            socket.broadcast.emit("onlineUser", { userId: socket.handshake.auth.userId, online: true})
        }

        
        socket.on("reconnect", async () => {
            if(mongoose.Types.ObjectId.isValid(socket.handshake.auth.userId)){
                await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(socket.handshake.auth.userId), {online: true})
                socket.broadcast.emit("onlineUser", { userId: socket.handshake.auth.userId, online: false})
            }
        });
        
        socket.on("disconnect", async ()=>{
            if(mongoose.Types.ObjectId.isValid(socket.handshake.auth.userId)){
                await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(socket.handshake.auth.userId), {online: false})
                socket.broadcast.emit("onlineUser", { userId: socket.handshake.auth.userId, online: false})
            }
        })


        socket.on("connect_error", async () => {
            if(mongoose.Types.ObjectId.isValid(socket.handshake.auth.userId)){
                await Users.findByIdAndUpdate(new mongoose.Types.ObjectId(socket.handshake.auth.userId), {online: false})
                socket.broadcast.emit("onlineUser", { userId: socket.handshake.auth.userId, online: false})
            }
        });
        
    });
}

module.exports = socketInit;
