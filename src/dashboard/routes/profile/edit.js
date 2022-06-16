const express = require("express");
const app = express();
const { ProfileEdit } = require("../../queries");
const { paramsValidationSingleLine } = require("../../../others/validation");
const BASE = "dashboard/profile/edit";
const API = {
    getDetails: "/",
};

const RENDER = {
    getDetails: BASE + "/",
};

const getShopId = (req) => {
    return req.session.user.shopId;
};

class ResponseObj {
    constructor(responsePage) {
        this.page = responsePage;
        this.response = {
            activeState: 4.2,
        };
    }
    response_json() {
        return JSON.parse(JSON.stringify(this.response));
    }
}

app.get(API.getDetails, async (req, res) => {
    const shopId = getShopId(req);
    let obj = new ResponseObj(RENDER.getDetails);
    obj.response.obj = await ProfileEdit.getDetails(shopId);
    res.render(obj.page, obj.response);
});

app.post(API.getDetails, async (req, res) => {
    const shopId = getShopId(req);
    let obj = new ResponseObj(RENDER.getDetails);
    try {
        paramsValidationSingleLine({
            body: req.body,
            params: [
                "name",
                "seller_name",
                "image",
                "about",
                "contact_number",
                "telephone_number",
                "open_time",
                "close_time",
            ],
        });
        let data = await ProfileEdit.updateSellerDetails(shopId, req.body);
        if (data.length > 0 && data[0] == 1) {
            obj.response.error = "update successfully";
        } else {
            obj.response.error = "update failed";
        }
    } catch (e) {
        console.log(e);
        obj.response.error = e.toString();
    }

    obj.response.obj = await ProfileEdit.getDetails(shopId);
    res.render(obj.page, obj.response);
});

module.exports = app;
