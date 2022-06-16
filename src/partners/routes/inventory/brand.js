const express = require("express");
const app = express();
const { BrandQueries } = require("../../queries");

const BASE = "partners/inventory/";
const API = {
    getBrand: "/",
    addBrand: "/add",
};

app.get(API.getBrand, async (req, res) => {
    let cat = await BrandQueries.getBrand();
    res.render(BASE + "brand", { activeState: 2.2, data: cat });
});

app.get(API.addBrand, async (req, res) => {
    res.render(BASE + "brand/add", { activeState: 2.2 });
});

app.post(API.addBrand, async (req, res) => {
    let details = "";
    let success = false;
    const { brand_name: name, brand_logo: logo } = req.body;
    console.log(name, logo);
    if (name && logo) {
        success = await BrandQueries.createBrand(name, logo);
        if (success) {
            details = "created successfully";
        } else {
            details = "Category already exists";
        }
    } else {
        details = "Fields does not empty";
    }
    res.render(BASE + "brand/add", {
        activeState: 2.1,
        details,
        success,
    });
});

module.exports = app;
