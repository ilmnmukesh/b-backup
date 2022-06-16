const express = require("express");
const app = express();
const { OrderDetails } = require("../../queries");

const BASE = "dashboard/order/details";
const API = {
    getDetails: "/",
    changeStatus: "/change",
    viewOrder: "/:id",
    retryPayment: "/:id/retry",
};

const RENDER = {
    getDetails: BASE + "/",
    getTable: BASE + "/table",
    viewOrder: BASE + "/view",
};

class ResponseObj {
    constructor(responsePage) {
        this.page = responsePage;
        this.response = {
            activeState: 3.2,
        };
    }
    response_json() {
        return JSON.parse(JSON.stringify(this.response));
    }
}

const getShopId = (req) => {
    return req.session.user.shopId;
};

app.get(API.getDetails, async (req, res) => {
    const shopId = getShopId(req);
    let obj = new ResponseObj(RENDER.getDetails, 3.2);
    const { t: status, date, amount } = req.query;
    obj.response.count = await OrderDetails.getCount(shopId);
    obj.response.data = await OrderDetails.getDetails(shopId, {
        status,
        date,
        amount,
    });
    obj.response.moment = require("moment");
    res.render(obj.page, obj.response);
});

app.get(API.changeStatus, async (req, res) => {
    const shopId = getShopId(req);
    let obj = new ResponseObj(RENDER.getTable, 3.2);
    const { t: status, date, amount } = req.query;
    obj.response.layout = false;
    obj.response.data = await OrderDetails.getDetails(shopId, {
        status,
        date,
        amount,
    });
    obj.response.moment = require("moment");
    res.render(obj.page, obj.response);
});

app.post(API.changeStatus, async (req, res) => {
    const shopId = getShopId(req);
    const { id, status, update, cid } = req.body;
    let obj = new ResponseObj(RENDER.getTable, 3.2);
    obj.response.layout = false;
    const result = await OrderDetails.changeStatus(shopId, id, update);
    obj.response.data = await OrderDetails.getDetails(shopId, { status });
    const io = req.app.get("socketio");
    io.emit("order_tracking_" + id + "_ecom_" + cid, {
        success: true,
        data: {
            status: update,
            result,
        },
    });

    obj.response.cnt = await OrderDetails.getShopCount(shopId);
    obj.response.moment = require("moment");
    res.render(obj.page, obj.response);
});

app.get(API.viewOrder, async (req, res) => {
    const shopId = getShopId(req);
    const { id } = req.params;
    let obj = new ResponseObj(RENDER.viewOrder, 3.2);

    obj.response.obj = await OrderDetails.viewOrder(shopId, id);
    if (obj.response.obj == null) {
        res.redirect("/dashboard/logout");
        res.end();
    }
    obj.response.id = id;
    obj.response.moment = require("moment");
    res.render(obj.page, obj.response);
});

app.post(API.retryPayment, async (req, res) => {
    const shopId = getShopId(req);
    const { id } = req.params;

    const obj = await OrderDetails.retryPayment(shopId, id);
    res.json(obj);
});
module.exports = app;
