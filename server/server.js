// server.js
require("dotenv").config();
const app = require("./app");

app.get('/', (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
