const express = require("express");
const crypto = require("crypto");
const session = require("express-session");
const { Shop, Partner } = require("../database");

const app = express();

app.use(
    session({
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: "shhhh, very secret",
        genid: (req) => {
            return crypto.randomUUID();
        },
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        },
    }),
);

app.use(async (req, res, next) => {
    if (req.session.user == null) {
        const obj = await Shop.findOne({
            where: { id: 41 },
            include: { model: Partner, attributes: ["id"] },
        });

        req.session.user = {
            partnerId: obj.partner.id,
            completed: 0,
            email: obj.email,
            shopId: obj.id,
            sellerName: obj?.sellerName,
            shopName: obj?.name,
            image: obj?.image,
            verified: true,
        };
    }
    res.locals.shopId = req.session.user.shopId;
    res.locals.shopDetails = {
        ...req.session.user,
    };
    next();
});

module.exports = app;
