const express = require("express");
const app = express();

const tracking = require("./tracking");
const details = require("./details");

app.use("/", (req, res, next) => {
    if (req.url == "/") {
        res.redirect("./product");
        res.end();
    }
    next();
});

app.use("/tracking", tracking);
app.use("/details", details);

module.exports = app;
