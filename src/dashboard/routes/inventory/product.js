const express = require("express");
const app = express();
const {
    ProductQueries,
    CategoryQueries,
    BrandQueries,
} = require("../../queries");
const { paramsValidationSingleLine } = require("../../../others/validation");

const BASE = "dashboard/inventory/product";
const API = {
    getProduct: "/",
    addProduct: "/add",
    viewProduct: "/:id",
    editProduct: "/:id/edit",
    deleteProduct: "/:id/delete",
    addBulkProduct: "/add/bulk/",
};

const RENDER = {
    getProduct: BASE,
    addProduct: BASE + "/add",
    editProduct: BASE + "/edit",
    viewProduct: BASE + "/view",
    deleteProduct: BASE + "/delete",
};

const paramsTypecheck = ({ body, params }) => {
    const typeCheck = (z) => {
        if (typeof z == "string" || typeof z == "object") {
            return true;
        }
        return false;
    };
    let err = "";
    params.forEach((e) => {
        if (!typeCheck(body[e])) {
            err += ", " + e;
        } else if (typeof body[e] == "string") {
            body[e] = [body[e]];
        }
    });
    if (err != "") throw "(" + err.slice(2) + ") fields are not valid";
};

const getShopId = (req) => {
    return req.session.user.shopId;
};

app.get(API.getProduct, async (req, res) => {
    const shopId = getShopId(req);
    const { page, q, category, brand } = req.query;
    let prod = await ProductQueries.getProduct(
        shopId,
        page ? page : 1,
        q,
        category,
        brand,
    );
    res.render(RENDER.getProduct, {
        activeState: 2.3,
        ...prod,
        q,
        categoryQ: category,
        brandQ: brand,
    });
});

app.get(API.addProduct, async (req, res) => {
    const category = await CategoryQueries.getCategory();
    const brand = await BrandQueries.getBrand();
    const units = await ProductQueries.getUnits();
    const multiplers = await ProductQueries.getMultiplers();
    res.render(RENDER.addProduct, {
        activeState: 2.3,
        category,
        units,
        brand,
        multiplers,
    });
});

app.post(API.addProduct, async (req, res) => {
    let data = req.body;
    let msg = "";
    const shopId = getShopId(req);
    const category = await CategoryQueries.getCategory();
    const brand = await BrandQueries.getBrand();
    const units = await ProductQueries.getUnits();
    const multiplers = await ProductQueries.getMultiplers();

    try {
        paramsValidationSingleLine({
            body: req.body,
            params: [
                "name",
                "description",
                "image",
                "category",
                "brand",
                "mrp",
                "volume",
                "discount",
                "units",
                "multiplers",
                "price",
            ],
        });
        paramsTypecheck({
            body: req.body,
            params: [
                "mrp",
                "discount",
                "units",
                "volume",
                "multiplers",
                "price",
            ],
        });

        data = await ProductQueries.addProduct(shopId, req.body);
    } catch (e) {
        msg = e.toString();
    }
    res.render(RENDER.addProduct, {
        msg,
        details: req.body,
        activeState: 2.3,
        ...data,
        category,
        units,
        brand,
        multiplers,
    });
});

app.get(API.viewProduct, async (req, res) => {
    const shopId = getShopId(req);
    let obj = await ProductQueries.viewProduct(req.params.id, shopId);
    res.render(RENDER.viewProduct, {
        activeState: 2.3,
        obj,
        id: req.params.id,
    });
});

app.post(API.addBulkProduct, async (req, res) => {
    const shopId = getShopId(req);
    let data = JSON.parse(req.body.obj);
    let result = await ProductQueries.bulkInsertProduct(shopId, data);
    res.json(result);
});

app.get(API.editProduct, async (req, res) => {
    const shopId = getShopId(req);
    let result = await ProductQueries.viewProduct(req.params.id, shopId);
    // console.log(JSON.stringify(result, undefined, 4));
    res.render(RENDER.editProduct, {
        activeState: 2.3,
        id: req.params.id,
        obj: result,
        category: await CategoryQueries.getCategory(),
        brand: await BrandQueries.getBrand(),
        units: await ProductQueries.getUnits(),
        multiplers: await ProductQueries.getMultiplers(),
    });
});

app.post(API.editProduct, async (req, res) => {
    const shopId = getShopId(req);
    var result = {};
    try {
        let skip = false;
        if (req.body.status == null && req.body.removeId != null) {
            req.body.status = [];
            skip = true;
        }
        if (!skip) {
            paramsValidationSingleLine({
                body: req.body,
                params: [
                    "name",
                    "description",
                    "image",
                    "category",
                    "brand",
                    "status",
                    "mrp",
                    "volume",
                    "discount",
                    "units",
                    "multiplers",
                    "price",
                ],
            });

            paramsTypecheck({
                body: req.body,
                params: [
                    "mrp",
                    "discount",
                    "units",
                    "volume",
                    "multiplers",
                    "status",
                    "price",
                ],
            });
        } else {
            paramsValidationSingleLine({
                body: req.body,
                params: [
                    "name",
                    "description",
                    "image",
                    "category",
                    "brand",
                    "status",
                    "removeId",
                ],
            });
        }

        result = await ProductQueries.updateProduct(
            shopId,
            req.params.id,
            req.body,
        );
    } catch (e) {
        result = {
            err: e,
        };
    }
    let obj = await ProductQueries.viewProduct(req.params.id, shopId);

    res.render(RENDER.editProduct, {
        activeState: 2.3,
        id: req.params.id,
        obj,
        ...result,
        category: await CategoryQueries.getCategory(),
        brand: await BrandQueries.getBrand(),
        units: await ProductQueries.getUnits(),
        multiplers: await ProductQueries.getMultiplers(),
    });
});

app.get(API.deleteProduct, async (req, res) => {
    const shopId = getShopId(req);
    let msg = "";
    try {
        msg = await ProductQueries.removeProduct(shopId, req.params.id);
    } catch (e) {
        msg = e.toString();
    }
    res.render(RENDER.deleteProduct, {
        activeState: 2.4,
        msg,
    });
});

module.exports = app;
