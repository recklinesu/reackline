const express = require("express");
const connectToMongo = require("./database");
const cors = require("cors");
const routeInit = require("./route")
const socketInit = require("./socket/users")

// Express uses
const app = express();
app.use(cors());
app.use(express.json());

// Defining port
const port = process.env.PORT || 5000;

// Connect to database
connectToMongo();
// Initialize routes
routeInit(app)

console.log('\x1b[35m'+"______                            _ _                    "+'\x1b[0m');
console.log('\x1b[35m'+"| ___ \\                          (_) |                   "+'\x1b[0m');
console.log('\x1b[35m'+"| |_/ /_   _   ______   _ __ ___  _| |__   ___  ___ _ __ "+'\x1b[0m');
console.log('\x1b[35m'+"| ___ \\ | | | |______| | '_ ` _ \\| | '_ \\ / _ \\/ _ \ '__|"+'\x1b[0m');
console.log('\x1b[35m'+"| |_/ / |_| |          | | | | | | | | | |  __/  __/ |   "+'\x1b[0m');
console.log('\x1b[35m'+"\\____/ \\__, |          |_| |_| |_|_|_| |_|\\___|\\___|_|   "+'\x1b[0m');
console.log('\x1b[35m'+"        __/ |                                            "+'\x1b[0m');
console.log('\x1b[35m'+"       |___/                                             "+'\x1b[0m');

// lIsten On Port
const Server = app.listen(port, () => {
  console.log('\x1b[33m'+`\n\n---------------------------\nApp is listening on port ${port}\n---------------------------\n\n`);
});

// Initialize Sockets
socketInit(Server)
