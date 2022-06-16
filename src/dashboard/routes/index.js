const express = require("express");
const app = express();

const inventory = require("./inventory");
const order = require("./order");
const profile = require("./profile");
const stripe = require("./stripe");
const dashboard = require("./dashboard");
const { socketForDashboard } = require("../socket");

socketForDashboard(app);

app.use("/inventory", inventory);
app.use("/order", order);
app.use("/profile", profile);
app.use("/stripe", stripe);
app.use("/", dashboard);

module.exports = app;
