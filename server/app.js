const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const assetsRoutes = require("./routes/asset.routes")


const app = express();

const envOrigins = (process.env.CLIENT_ORIGINS || "http://10.23.33.13:82")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || envOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/admin", userRoutes);
app.use("/api/assets", assetsRoutes)


module.exports = app;
