const routes = require("express").Router();
const app = require("./routes");
const socket = require("./socket");

routes.use(socket);
routes.use(app);

module.exports = routes;
