const { OrderDetails } = require("./queries");

const alert_connection = async (req, res, next, condition = true) => {
    if (condition) {
        const io = req.app.get("socketio");
        const shopId = req.session.user.shopId;
        const count_query = await OrderDetails.getShopCount(shopId);
        if (req.session.user.alert) {
            req.session.user.alert = false;
            io.once("connection", async (soc) => {
                io.emit("alert_shop_" + shopId, {
                    fromHook: "Middleware!",
                    display: true,
                    alert: count_query,
                });

                soc.on("disconnect", (_) => {
                    console.log("disconnecting");
                    soc.removeAllListeners("alert_shop_" + shopId);
                });
            });
        }

        res.locals.alert_count = count_query;
        console.log(io.listeners("connection"));
    }

    next();
};

const socketForDashboard = (app) => {
    const removeInv = [
        "/inventory/product/post/search",
        "/inventory/product/post/varient",
    ];
    app.get("/", async (req, res, next) => {
        await alert_connection(req, res, next, req.url == "/");
    });

    app.get("/inventory/*", async (req, res, next) => {
        await alert_connection(
            req,
            res,
            next,
            removeInv.find((e) => req.url.startsWith(e)) == null,
        );
    });
    app.get("/order/details", alert_connection);
    app.get("/profile/*", alert_connection);
    app.get("/stripe", alert_connection);
};

const trackingSocket = (req, shopId) => {
    const io = req.app.get("socketio");

    io.once("connection", (soc) => {
        console.log("order connect");
        soc.emit("shopListener_" + shopId, {
            message: "Welcome!",
            display: false,
        });
        soc.on("disconnect", (_) => {
            console.log("order disconnect");
            soc.removeAllListeners("shopListener_" + shopId);
            console.log(io.listeners("connection"));
        });
    });
    console.log(io.listeners("connection"));
};

module.exports = {
    socketForDashboard,
    trackingSocket,
};
