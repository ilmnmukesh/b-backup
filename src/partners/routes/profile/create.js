const express = require("express");
const app = express();
const { ProfileCreate } = require("../../queries");

const BASE = "partners/profile/create";
const API = {
    addProfile: "/",
    updateProfile: "/update/",
};

const RENDER = {
    createProfile: BASE + "/",
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

const callCnt = (shop) => {
    if (!shop?.name && !shop?.sellerName) return 0;
    if (!shop?.about) return 1;
    if (!shop?.image) return 2;
    if (
        !(
            shop?.mobileNumber ||
            shop?.telephoneNumber ||
            shop?.openTime ||
            shop?.closeTime
        )
    )
        return 3;
    if (!(shop?.location || shop?.latitude || shop?.longitude)) return 4;
    return 5;
};

app.get(API.addProfile, async (req, res) => {
    const { shopId } = req.session.user;
    let obj = new ResponseObj(RENDER.createProfile);
    obj.response.layout = false;
    obj.response.seller = await ProfileCreate.getSeller(shopId);
    if (callCnt(obj.response.seller) == 5) res.redirect("/partners");
    else res.render(obj.page, obj.response);
});

app.post(API.updateProfile, async (req, res) => {
    try {
        const { shopId } = req.session.user;
        let obj = await ProfileCreate.updateDetails(shopId, req.body);
        if (obj) {
            if (req.body?.name) {
                req.session.user.shopName = req.body?.name;
            }
            if (req.body?.image) {
                req.session.user.image = req.body?.image;
            }

            res.json({ success: true, msg: "update successfully" });
        } else {
            res.json({ success: false, msg: "update failed" });
        }
    } catch (e) {
        res.json({
            success: false,
            msg: "update failed due to " + e.toString(),
        });
    }
});

module.exports = app;
