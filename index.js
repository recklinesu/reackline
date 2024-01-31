const express = require("express");
const connectToMongo = require("./database");
const cors = require("cors");


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

connectToMongo();

const authRoutes = require("./routes/authV1");
const domainRoutes = require("./routes/domain");
const roleRoutes = require("./routes/roles");

app.get("/", (req, res)=>{
  res.send("Welcome to the API");
})

app.use("/api", domainRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", roleRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

console.log('\x1b[35m'+"______                            _ _                    "+'\x1b[0m');
console.log('\x1b[35m'+"| ___ \\                          (_) |                   "+'\x1b[0m');
console.log('\x1b[35m'+"| |_/ /_   _   ______   _ __ ___  _| |__   ___  ___ _ __ "+'\x1b[0m');
console.log('\x1b[35m'+"| ___ \\ | | | |______| | '_ ` _ \\| | '_ \\ / _ \\/ _ \ '__|"+'\x1b[0m');
console.log('\x1b[35m'+"| |_/ / |_| |          | | | | | | | | | |  __/  __/ |   "+'\x1b[0m');
console.log('\x1b[35m'+"\\____/ \\__, |          |_| |_| |_|_|_| |_|\\___|\\___|_|   "+'\x1b[0m');
console.log('\x1b[35m'+"        __/ |                                            "+'\x1b[0m');
console.log('\x1b[35m'+"       |___/                                             "+'\x1b[0m');

app.listen(port, () => {
  console.log('\x1b[33m'+`\n\n---------------------------\nApp is listening on port ${port}\n---------------------------\n\n`);
});
