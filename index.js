const express = require("express");
const connectToMongo = require("./database");
const authRoutes = require("./routes/auth");
const domainRoutes = require("./routes/domain");

const app = express();
const port = process.env.PORT || 5000;

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
