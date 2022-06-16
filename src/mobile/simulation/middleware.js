const express = require("express")();
const { Token } = require("../../database");
const KEYWORD = "Token";
const authentication = async (req, res, next) => {
    const t = req.headers.authorization?.split(" ");
    if (!t || t[0].toLowerCase() != KEYWORD.toLocaleLowerCase()) {
        res.status(401).send({
            details: "Invalid token header.",
        });
    } else if (t.length == 1) {
        res.status(401).send({
            details: "Invalid token header. No credentials provided.",
        });
    } else if (t.length > 2) {
        res.status(401).send({
            details:
                "Invalid token header. Token string should not contain spaces.",
        });
    } else {
        const token = await Token.findByPk(t[1]);
        if (token == null) {
            res.status(401).send({
                details: "Invalid token.",
            });
        } else {
            req.customer = token;
            next();
        }
    }
};

express.use("/customer", authentication);
module.exports = express;
