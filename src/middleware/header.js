const express = require("express");
const layout = require("express-ejs-layouts");
module.exports = (app) => {
    app.use("/api", function (req, res, next) {
        res.contentType("application/json");
        next();
    });
    app.use(
        express.static("assets/js", {
            setHeaders: function (res, path, stat) {
                res.contentType("text/javascript");
            },
        }),
    );
    var options = {
        setHeaders: function (res, path, stat) {
            res.contentType("image/png");
        },
    };

    app.use(express.static("assets", options));

    app.use("/api", express.json());
    app.use("/api", express.urlencoded({ extended: false }));

    app.use("/admin", (req, res, next) => {
        res.setHeader("Content-Type", "text/html");
        next();
    });
    app.use(layout);
    app.set("view engine", "ejs");
    app.use("/api/admin", require("../admin/api"));
};
