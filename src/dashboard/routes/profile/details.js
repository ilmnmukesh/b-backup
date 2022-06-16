const express = require("express");
const app = express();
const { ProfileDetails } = require("../../queries");

const BASE = "dashboard/profile/details";
const API = {
    getDetails: "/",
    getLocation: "/location",
};

const RENDER = {
    getDetails: BASE + "/",
    getLocation: BASE + "/../create/map",
};

class ResponseObj {
    constructor(responsePage) {
        this.page = responsePage;
        this.response = {
            activeState: 4.1,
        };
    }
    response_json() {
        return JSON.parse(JSON.stringify(this.response));
    }
}

app.get(API.getDetails, async (req, res) => {
    const { shopId } = req.session.user;
    let obj = new ResponseObj(RENDER.getDetails);
    obj.response.obj = await ProfileDetails.getDetails(shopId);
    obj.response.moment = require("moment");
    res.render(obj.page, obj.response);
});

app.get(API.getLocation, async (req, res) => {
    const { shopId } = req.session.user;
    let obj = new ResponseObj(RENDER.getLocation);
    obj.response.obj = await ProfileDetails.getDetails(shopId);
    obj.response.moment = require("moment");
    res.render(obj.page, obj.response);
});

module.exports = app;
