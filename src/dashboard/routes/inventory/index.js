const express = require("express");
const app = express();

const category = require("./category");
const brand = require("./brand");
const product = require("./product");
const post = require("./post");
const combo = require("./combo");
const image = require("./image");

app.use("/", (req, res, next) => {
    if (req.url == "/") {
        res.redirect("./product");
        res.end();
    }
    next();
});

app.use("/category", category);
app.use("/brand", brand);
app.use("/product/post", post);
app.use("/product", product);
app.use("/images", image);
app.use("/combo", combo);

module.exports = app;
