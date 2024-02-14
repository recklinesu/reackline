// socketInit.js

const socketIO = require('socket.io');

function socketInit(server) {
    const io = socketIO(server);

    // Define event handlers
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Handle disconnect event
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        // Handle custom events
        socket.on('some_event', (data) => {
            console.log('Received data:', data);
        });
    });
}

module.exports = socketInit;
