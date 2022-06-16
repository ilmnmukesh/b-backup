const routes = require("express").Router();
const app = require("./routes");

routes.use(app);
module.exports = routes;
