const express = require("express");
const app = express();
const ProductQueires = require("../../queries/inventory/product");
const { s3 } = require("../../s3");

const BASE = "dashboard/inventory/images";
const API = {
    getImage: "/",
    uploadImage: "/upload",
};

const RENDER = {
    getImage: BASE + "/",
};
const shopId = 28;

app.get(API.getImage, async (req, res) => {
    res.render(RENDER.getImage, {
        activeState: 2.5,
    });
});

app.post(API.uploadImage, async (req, res) => {
    const { encodeImg, productId, name } = req.body;
    let data = Buffer.from(
        encodeImg.replace(/^data:image\/\w+;base64,/, ""),
        "base64",
    );
    let n = name
        .toLowerCase()
        .replace(/ /g, "_")
        .replace(/[^\w-]+/g, "");
    var params = {
        Key: `product/${n}.png`,
        Body: data,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentEncoding: "base64",
        ContentType: "image/png",
    };
    s3.upload(params, async (err, data) => {
        if (!err && productId != null && productId != "") {
            if (
                !(await ProductQueires.updateImgUrlProduct(
                    productId,
                    data.Location,
                ))
            ) {
                err = { err: "Unable to update" };
            }
        }
        res.json({ err, data });
    });
});
module.exports = app;
