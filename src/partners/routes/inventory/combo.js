const express = require("express");
const app = express();
const { ComboQueries } = require("../../queries");
const { s3 } = require("../../../dashboard/s3");
const { paramsValidationSingleLine } = require("../../../others/validation");
const BASE = "partners/inventory/combo";
const API = {
    getCombo: "/",
    addCombo: "/add/",
    getKitchenDetails: "/kitchen",
    editCombo: "/:id/edit",
    deleteCombo: "/:id/delete",
    viewCombo: "/:id/",
};

const RENDER = {
    getCombo: BASE + "/",
    viewCombo: BASE + "/view",
    addCombo: BASE + "/add",
    editCombo: BASE + "/edit",
    deleteCombo: BASE + "/delete",
    getKitchenDetails: BASE + "/kicthen_details",
};

const getShopId = (req) => {
    return req.session.user.shopId;
};

app.get(API.getCombo, async (req, res) => {
    const shopId = getShopId(req);
    const { page, q, brand } = req.query;
    let prod = await ComboQueries.getProduct(shopId, page ? page : 1, q, brand);

    res.render(RENDER.getCombo, {
        activeState: 2.4,
        ...prod,
        page: page == null ? 1 : page,
        q,
        brandQ: brand,
    });
});

app.get(API.getKitchenDetails, async (req, res) => {
    const shopId = getShopId(req);
    const { q } = req.query;
    let data = await ComboQueries.listKitchenItem(q, shopId);
    res.render(RENDER.getKitchenDetails, {
        layout: false,
        data,
    });
});

app.get(API.addCombo, async (req, res) => {
    const shopId = getShopId(req);
    const { vid, kid } = req.query;
    const data = await ComboQueries.addComboPredefined(shopId, vid, kid);
    res.render(RENDER.addCombo, {
        ...data,
        activeState: 2.4,
        shopId,
    });
});
app.post(API.addCombo, async (req, res) => {
    const shopId = getShopId(req);
    let predefined = { varient: null, kitchenItem: null };
    const { name, image_encrypt } = req.body;
    if (await ComboQueries.checkProductName(name)) {
        res.render(RENDER.addCombo, {
            activeState: 2.4,
            shopId,
            ...predefined,
            err: "Product name already exists!!",
        });
    } else if (image_encrypt != null && image_encrypt != "") {
        let data = Buffer.from(
            image_encrypt.replace(/^data:image\/\w+;base64,/, ""),
            "base64",
        );
        let n = name
            .toLowerCase()
            .replace(/ /g, "_")
            .replace(/[^\w-]+/g, "");
        var params = {
            Key: `partners/combo/${n}.png`,
            Body: data,
            Bucket: process.env.AWS_BUCKET_NAME,
            ContentEncoding: "base64",
            ContentType: "image/png",
        };
        s3.upload(params, async (err, data) => {
            if (!err) {
                req.body.image = data.Location;
                let d = await ComboQueries.addProduct(shopId, req.body);
                if (d) {
                    msg = `successfully created ${name}`;
                } else {
                    msg = `unable to create `;
                }
            }
            res.render(RENDER.addCombo, {
                activeState: 2.4,
                shopId,
                err: msg,
                errors: err,
                ...predefined,
            });
        });
    } else {
        let data = await ComboQueries.addProduct(shopId, req.body);
        if (data) {
            msg = `successfully created ${name}`;
        } else {
            msg = `unable to create `;
        }
        res.render(RENDER.addCombo, {
            activeState: 2.4,
            shopId,
            data,
            err: msg,
            ...predefined,
        });
    }
});

app.get(API.viewCombo, async (req, res) => {
    const shopId = getShopId(req);
    let obj = await ComboQueries.viewProduct(req.params.id, shopId);
    res.render(RENDER.viewCombo, {
        activeState: 2.4,
        obj,
        id: req.params.id,
    });
});

app.get(API.editCombo, async (req, res) => {
    const shopId = getShopId(req);
    let obj = await ComboQueries.viewProduct(req.params.id, shopId);
    res.render(RENDER.editCombo, {
        activeState: 2.4,
        id: req.params.id,
        obj,
        multiplers: await ComboQueries.getAllMultiplers(),
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
                "multiplerId",
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
        multiplers: await ComboQueries.getAllMultiplers(),
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
