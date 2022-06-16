const app = require("express")();

const stripe = require("./stripe");

app.use("/stripe", stripe);

module.exports = app;
