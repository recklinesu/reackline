const express = require("express");
const connectToMongo = require("./database");
const cors = require("cors");

const authRoutes = require("./routes/authV1");
const domainRoutes = require("./routes/domain");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

connectToMongo();

app.use("/api", domainRoutes);
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});