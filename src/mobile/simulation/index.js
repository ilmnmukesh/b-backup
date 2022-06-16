const routes = require("express").Router();
const app = require("./routes");
const middleware = require("./middleware");

routes.use(middleware);
routes.use(app);
module.exports = routes;
