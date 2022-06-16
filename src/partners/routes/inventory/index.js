const express = require("express");
const app = express();

app.use("/category", require("./category"));
app.use("/brand", require("./brand"));
app.use("/product", require("./product"));
app.use("/combo", require("./combo"));

module.exports = app;
