const express = require("express");
const app = express();
const { PostQueries } = require("../../queries");

const BASE = "dashboard/inventory/product/";
const API = {
    getPost: "/",
    searchProductPost: "/search",
    varientProduct: "/varient",
    editPost: "/edit",
};

const RENDER = {
    getPost: BASE + "post",
    getPostSuccess: BASE + "post/success",
    searchProductPost: BASE + "post/search_prod",
    varientProduct: BASE + "post/search_varient",
    editPost: BASE + "post/edit",
};

const getShopId = (req) => {
    return req.session.user.shopId;
};

app.get(API.getPost, async (req, res) => {
    const { vid } = req.query;
    let data = JSON.parse(
        JSON.stringify(await PostQueries.getProductVarientData(vid)),
    );
    res.render(RENDER.getPost, {
        activeState: 2.3,
        data,
    });
});

app.post(API.getPost, async (req, res) => {
    const shopId = getShopId(req);
    let result = await PostQueries.createPost({ shopId, ...req.body });

    res.render(RENDER.getPostSuccess, {
        activeState: 2.3,
        ...result,
    });
});

app.get(API.searchProductPost, async (req, res) => {
    const { q } = req.query;
    res.render(RENDER.searchProductPost, {
        layout: false,
        data: await PostQueries.getSearchProduct(q),
    });
});

app.get(API.varientProduct, async (req, res) => {
    const { pid } = req.query;
    const shopId = getShopId(req);

    res.render(RENDER.varientProduct, {
        layout: false,
        data: await PostQueries.getProductVarient(pid, shopId),
    });
});

app.get(API.editPost, async (req, res) => {
    const shopId = getShopId(req);
    const { i } = req.query;
    let data = JSON.parse(JSON.stringify(await PostQueries.getPost(i, shopId)));
    res.render(RENDER.editPost, {
        activeState: 2.3,
        data,
    });
});

app.post(API.editPost, async (req, res) => {
    const shopId = getShopId(req);
    let data = await PostQueries.updatePost({ shopId, ...req.body });
    res.render(RENDER.getPostSuccess, {
        activeState: 2.3,
        ...data,
    });
});

module.exports = app;
