const app = require("express")();
const { ProductQueries } = require("../../queries");

const BASE = "partners/inventory/product";
const API = {
    getProduct: "/",
    searchProduct: "/search",
    viewProduct: "/:id",
    getVolume: "/volume/:pid",
};

const RENDER = {
    getProduct: BASE,
    searchProduct: BASE + "/search_prod",
    viewProduct: BASE + "/view",
    getVolume: BASE + "/view_volume",
};

const getShopId = (req) => {
    return req.session.user.shopId;
};

app.get(API.getProduct, async (req, res) => {
    const { page, q, category, brand } = req.query;
    let prod = await ProductQueries.getProduct(
        page ? page : 1,
        q,
        category,
        brand,
    );
    res.render(RENDER.getProduct, {
        activeState: 2.3,
        ...prod,
        q,
        page: page == null ? 1 : page,
        categoryQ: category,
        brandQ: brand,
    });
});

app.get(API.searchProduct, async (req, res) => {
    const { q } = req.query;
    res.render(RENDER.searchProduct, {
        layout: false,
        data: await ProductQueries.searchProduct(q),
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

app.get(API.getVolume, async (req, res) => {
    const { pid } = req.params;
    res.render(RENDER.getVolume, {
        layout: false,
        data: await ProductQueries.listOfVolume(pid),
    });
});
module.exports = app;
