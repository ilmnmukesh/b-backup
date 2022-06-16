const express = require("express");
const crypto = require("crypto");
const session = require("express-session");
const {
    createAccountLink,
    updateSellerVerified,
    getAccountDetails,
} = require("../others/payment");

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

var hashPwd = function hashPwd(salt, pwd) {
    var hmac = crypto.createHmac("sha256", salt);
    return hmac.update(pwd).digest("hex");
};

const callCnt = (shop) => {
    if (!shop?.name && !shop?.sellerName) return 0;
    if (!shop?.about) return 1;
    if (!shop?.image) return 2;
    if (
        !(
            shop?.mobileNumber ||
            shop?.telephoneNumber ||
            shop?.openTime ||
            shop?.closeTime
        )
    )
        return 3;
    if (!(shop?.location || shop?.latitude || shop?.longitude)) return 4;
    return 5;
};

const authenticates = async (email, pass) => {
    const { SellerAuth, Shop } = require("../database");
    const seller = await SellerAuth.findOne({
        where: { email },
        include: [Shop],
    });
    if (seller) {
        pass = hashPwd(seller.salt, pass);
        if (pass == seller.password) {
            return {
                authId: seller.id,
                completed: callCnt(seller.shop),
                email: seller.email,
                shopId: seller.shopId,
                sellerName: seller.shop?.sellerName,
                shopName: seller.shop?.name,
                image: seller.shop?.image,
                verified: seller.isVerified,
            };
        }
        throw "password incorrect";
    }
    throw "incorret details";
};

app.get("/login", function (req, res) {
    if (req.session.user && req.session.user.shopId) {
        res.redirect("/dashboard");
    } else {
        res.render("dashboard/auth", { layout: false });
    }
});

app.post("/login", async (req, res, next) => {
    try {
        const user = await authenticates(req.body.email, req.body.password);
        req.session.regenerate(async () => {
            req.session.user = user;
            req.session.user.alert = true;
            if (!user.verified) {
                res.redirect(await createAccountLink(user.authId));
            } else if (user.completed != 5) {
                res.redirect("/dashboard/profile/create/");
            } else {
                if (req.query.next) {
                    res.redirect(req.query.next);
                } else res.redirect("/dashboard");
            }
        });

        // next();
    } catch (e) {
        res.redirect(
            `${req.baseUrl + req.path}?next=${
                req.params.next ? req.params.next : ""
            }&msg=${e}`,
        );
    }
});

app.use((req, res, next) => {
    if (
        req.session.user &&
        req.session.user.shopId &&
        req.session.user.verified
    ) {
        res.locals.shopId = req.session.user.shopId;
        res.locals.shopDetails = {
            ...req.session.user,
        };
        next();
    } else if (req.originalUrl == "/dashboard/connect/update/") {
        next();
    } else {
        req.session.destroy(() => {
            res.redirect("/dashboard/login?next=" + req.originalUrl);
        });
    }
});

app.get("/logout", function (req, res) {
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function () {
        res.redirect("/dashboard/");
    });
});

app.get("/connect/update", async (req, res) => {
    if (req.session?.user?.shopId) {
        let details = await getAccountDetails(req.session.user.authId);
        if (
            details?.requirements?.currently_due.length == 0 &&
            details?.requirements?.eventually_due.length == 0
        ) {
            await updateSellerVerified(req.session.user.shopId, true);
            req.session.user.verified = true;
            if (req.session.user.completed != 5) {
                res.redirect("/dashboard/profile/create/");
            } else {
                res.redirect("/dashboard");
            }
        } else {
            res.redirect("/dashboard/logout");
        }
    } else {
        res.redirect("/dashboard/logout");
    }
});

module.exports = app;
