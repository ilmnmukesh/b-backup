const express = require("express");
const app = express();
require("dotenv").config();
const { middleware } = require("./src");
const { scheduleStartup } = require("./src/others/schedule");
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" },
});
app.set("socketio", io);

middleware(app);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    scheduleStartup();
});

const serverless = require("serverless-http");
module.exports.handler = serverless(app);
