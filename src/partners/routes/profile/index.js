const express = require("express");
const app = express();

const details = require("./details");
const edit = require("./edit");
const create = require("./create");

app.use("/details", details);
app.use("/edit", edit);
app.use("/create", create);
module.exports = app;
