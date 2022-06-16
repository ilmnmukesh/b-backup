const morgan = require("./morgan");
const header = require("./header");
const routes = require("../routes");

module.exports = (app) => {
    morgan(app);
    header(app);
    routes(app);
};
