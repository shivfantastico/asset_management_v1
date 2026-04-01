const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const assetsRoutes = require("./routes/asset.routes")


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", userRoutes);
app.use("/api/assets", assetsRoutes)


module.exports = app;
