const express = require("express");
const main = express();
const routes = require("./routes");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
/**
 * @param {main} app The date
 */
module.exports = (app) => {
    // console.log(path.join(__dirname, "../views"));
    // app.use(expressLayouts);
    // app.set("views", path.join(__dirname, "../views"));
    // app.use("/partners", (req, res, next) => {
    //     req.app.set("layout", "index");
    //     next();
    // });
    // app.set("layout", "partners");

    app.use("/partners", express.json());
    app.use(express.urlencoded({ extended: true }));
    // app.use(
    //     "/partners",
    //     express.urlencoded({ limit: "10mb", extended: false }),
    // );
    app.use("/partners", (req, res, next) => {
        const old = res.render;
        res.render = (x, y) => {
            if (y.layout != false) {
                y.layout = "partners";
            }
            old.apply(res, [x, y]);
        };
        next();
    });
    app.use("/partners/asset/", express.static(__dirname + "/assets"));
    // app.use(express.limit("20mb"));
    app.use("/partners", require("./auth"));
    app.use("/partners", routes);
};
