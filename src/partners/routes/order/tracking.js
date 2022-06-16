const express = require("express");
const app = express();
const { OrderTracking } = require("../../queries");
const { paramsValidation } = require("../../../others/validation");
const { trackingSocket } = require("../../socket");
const BASE = "partners/order/tracking";
const API = {
    getTracking: "/",
    updateStatus: "/update",
};
const RENDER = {
    getTracking: BASE + "/",
};

class ResponseObj {
    constructor(responsePage, actSt) {
        this.page = responsePage;
        this.response = {
            activeState: actSt,
        };
    }
}
const getShopId = (req) => {
    return req.session.user.shopId;
};

app.get(API.getTracking, async (req, res) => {
    const shopId = getShopId(req);
    let obj = new ResponseObj(RENDER.getTracking, 3.1);
    trackingSocket(req, shopId);
    obj.response.data = await OrderTracking.getNewOrders(shopId);
    obj.response.count = await OrderTracking.getNewOrderCount(shopId);
    obj.response.moment = require("moment");
    res.render(obj.page, obj.response);
});

app.post(API.updateStatus, async (req, res) => {
    const shopId = getShopId(req);
    let success = false;
    try {
        const { id, status, cid } = req.body;
        paramsValidation({ body: req.body, params: ["id", "status", "cid"] });
        let result = await OrderTracking.changeStatus(shopId, id, status);
        if (result.length > 0 && result[0] == 1) {
            success = true;
            const io = req.app.get("socketio");
            io.emit("order_tracking_" + id + "_ecom_" + cid, {
                success: true,
                data: {
                    status,
                    result,
                },
            });
        }
        res.json({ success });
    } catch (e) {
        console.log(e);
        res.json({ success, err: "Invalid request", e });
    }
});

module.exports = app;
