require("dotenv").config(); // For environment variables.
const app = require("./app");

// TUNING SERVER
const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server Started!");
});