const express = require("express");
const { paramsValidationSingleLine } = require("../../../others/validation");
const app = express();
const { ComboQueries } = require("../../queries");

const BASE = "dashboard/inventory/combo";

const getShopId = (req) => {
    return req.session.user.shopId;
};

const API = {
    getCombo: "/",
    addCombo: "/add",
    viewCombo: "/:id",
    editCombo: "/:id/edit",
    deleteCombo: "/:id/delete",
    bulkCombo: "/add/bulk",
};

const RENDER = {
    getCombo: BASE + "/",
    addCombo: BASE + "/add",
    viewCombo: BASE + "/view",
    editCombo: BASE + "/edit",
    deleteCombo: BASE + "/delete",
};

app.get(API.getCombo, async (req, res) => {
    const shopId = getShopId(req);
    const { page, q, brand } = req.query;
    let prod = await ComboQueries.getProduct(shopId, page ? page : 1, q, brand);

    res.render(RENDER.getCombo, {
        activeState: 2.4,
        ...prod,
        q,
        brandQ: brand,
    });
});

app.get(API.addCombo, async (req, res) => {
    res.render(RENDER.addCombo, {
        activeState: 2.4,
    });
});

app.get(API.viewCombo, async (req, res) => {
    const shopId = getShopId(req);
    let obj = await ComboQueries.viewProduct(req.params.id, shopId);
    res.render(RENDER.viewCombo, {
        activeState: 2.4,
        id: req.params.id,
        obj,
    });
});

app.post(API.bulkCombo, async (req, res) => {
    const shopId = getShopId(req);
    let obj = req.body["obj"];
    obj = JSON.parse(obj);
    let result = await ComboQueries.insertBulkProduct(shopId, obj);
    res.json(result);
});

app.post(API.addCombo, async (req, res) => {
    var result = {};
    const shopId = getShopId(req);
    try {
        paramsValidationSingleLine({
            body: req.body,
            params: [
                "name",
                "description",
                "image",
                "mrp",
                "discount",
                "volume",
                "selling_price",
            ],
        });
        result = await ComboQueries.addProduct(shopId, req.body);
    } catch (e) {
        result = {
            err: e,
        };
    }
    res.render(RENDER.addCombo, {
        activeState: 2.4,
        ...result,
    });
});

app.get(API.editCombo, async (req, res) => {
    const shopId = getShopId(req);
    let obj = await ComboQueries.viewProduct(req.params.id, shopId);
    res.render(RENDER.editCombo, {
        activeState: 2.4,
        id: req.params.id,
        obj,
    });
});

app.post(API.editCombo, async (req, res) => {
    const shopId = getShopId(req);
    var result = {};
    try {
        paramsValidationSingleLine({
            body: req.body,
            params: [
                "name",
                "description",
                "image",
                "mrp",
                "discount",
                "volume",
                "price",
            ],
        });
        result = await ComboQueries.updateProduct(
            shopId,
            req.params.id,
            req.body,
        );
    } catch (e) {
        result = {
            err: e,
        };
    }
    let obj = await ComboQueries.viewProduct(req.params.id, shopId);
    res.render(RENDER.editCombo, {
        activeState: 2.4,
        id: req.params.id,
        obj,
        ...result,
    });
});

app.get(API.deleteCombo, async (req, res) => {
    const shopId = getShopId(req);
    let msg = "";
    try {
        msg = await ComboQueries.deleteProduct(shopId, req.params.id);
    } catch (e) {
        msg = e.toString();
    }
    res.render(RENDER.deleteCombo, {
        activeState: 2.4,
        msg,
    });
});

module.exports = app;
