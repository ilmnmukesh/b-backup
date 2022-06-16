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
    app.use(expressLayouts);
    // app.set("views", path.join(__dirname, "../views"));
    app.set("layout", "dashboard");

    app.use("/dashboard", express.json());
    app.use(
        "/dashboard",
        express.urlencoded({ limit: "10mb", extended: false }),
    );

    app.use("/seller/asset/", express.static(__dirname + "/assets"));

    // app.use(express.limit("20mb"));
    app.use("/dashboard", require("./auth"));
    app.use("/dashboard", routes);
};
