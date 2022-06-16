const { sendMail } = require("../../../others/mail");
const { ShopQueries } = require("../../../others/queries");
const { paramsValidation } = require("../../../others/validation");

module.exports = {
    shopState: async (_, response) => {
        response.success = true;
        response.data = await ShopQueries.getState();
    },

    shopDetails: async (req, response) => {
        response.success = true;
        const { id } = req.params;
        const { lat, lng, state } = req.query;
        response.data = await ShopQueries.getDetails(id, lat, lng, state);
    },

    shopBasedCatProduct: async (req, response) => {
        const { id } = req.params;
        const { cid } = req.query;
        response.data = await ShopQueries.getShopProducts(id, cid);
        response.success = true;
    },

    addShopReview: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["name", "comment", "rating", "shopId"],
        });
        let [created, result] = await ShopQueries.addShopReview(req.body);
        if (created) {
            response.description = "review add successfully";
            response.data = result;
            response.success = true;
        } else {
            response.description =
                "review failed to add shop id doesn't matched";
        }
    },

    getShopReview: async (req, response) => {
        const { q, sid, page } = req.query;
        response.data = await ShopQueries.getShopReview(parseInt(q), sid, page);
        response.success = true;
    },

    contactSeller: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["mail", "text"],
        });
        const { mail, text } = req.body;
        response.data = await sendMail(mail, text);
        response.success = true;
    },
};
