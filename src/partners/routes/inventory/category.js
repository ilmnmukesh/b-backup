const express = require("express");
const app = express();
const { CategoryQueries } = require("../../queries");

const BASE = "partners/inventory/";
const API = {
    getCategory: "/",
    addCategory: "/add",
};

app.get(API.getCategory, async (req, res) => {
    let cat = await CategoryQueries.getCategory();
    res.render(BASE + "category", {
        activeState: 2.1,
        data: cat,
    });
});

app.get(API.addCategory, async (req, res) => {
    res.render(BASE + "category/add", { activeState: 2.1 });
});

app.post(API.addCategory, async (req, res) => {
    let details = "";
    let success = false;
    const { category_name: name, category_code: code } = req.body;
    if (name && code) {
        success = await CategoryQueries.createCategory(name, code);
        if (success) {
            details = "created successfully";
        } else {
            details = "Category already exists";
        }
    } else {
        details = "Fields does not empty";
    }
    res.render(BASE + "category/add", {
        activeState: 2.1,
        details,
        success,
    });
});

module.exports = app;
