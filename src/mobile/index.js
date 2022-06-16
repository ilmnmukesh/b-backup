module.exports = (app) => {
    app.use("/api", require("./ecommerce"));
    app.use("/api/cloud", require("./cloud"));
    app.use("/api/simulation", require("./simulation"));
};
