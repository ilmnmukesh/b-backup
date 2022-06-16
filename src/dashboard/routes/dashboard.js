const express = require("express");
const app = express();
const { DashboardQueries } = require("../queries");

const BASE = "dashboard/inventory";
const API = {
    getDetails: "/",
};

const RENDER = {
    getDetails: BASE + "/",
};

class ResponseObj {
    constructor(responsePage) {
        this.page = responsePage;
        this.response = {
            activeState: 1,
        };
    }
    response_json() {
        return JSON.parse(JSON.stringify(this.response));
    }
}

app.get("/", async (req, res) => {
    let obj = new ResponseObj(RENDER.getDetails);
    const shopId = req.session.user.shopId;
    obj.response.one = await DashboardQueries.getDashboard(shopId);
    obj.response.chart = {
        ...(await DashboardQueries.getCountAndTotal(shopId)),
        three: await DashboardQueries.getProductGraph(shopId),
    };
    obj.response.moment = require("moment");
    obj.response.data = await DashboardQueries.getOrder(shopId);
    obj.response.bar = await DashboardQueries.getProductBar(shopId);
    res.render(obj.page, obj.response);
});
module.exports = app;
