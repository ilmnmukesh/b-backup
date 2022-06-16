const express = require("express");
const {
    createLoginLink,
    updateSellerVerified,
    createAccountLink,
    getAccountDetails,
} = require("../../others/payment");
const app = express();

app.get("/", async (req, res) => {
    if (req.session?.user?.shopId) {
        let details = await getAccountDetails(req.session.user.authId);
        details.activeState = 5;
        res.render("dashboard/stripe", details);
    } else {
        res.redirect("/dashboard/logout");
    }
});

app.get("/login", async (req, res) => {
    if (req.session?.user?.authId) {
        try {
            res.redirect(await createLoginLink(req.session.user.authId));
        } catch (e) {
            await updateSellerVerified(req.session.user.shopId, false);
            res.redirect(await createAccountLink(req.session.user.authId));
        }
    } else {
        res.redirect("/dashboard/logout");
    }
});

app.get("/update", async (req, res) => {
    if (req.session?.user?.shopId) {
        res.redirect(await createAccountLink(req.session.user.authId));
    } else {
        res.redirect("/dashboard/logout");
    }
});

module.exports = app;
