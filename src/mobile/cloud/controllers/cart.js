const { CartQueries } = require("../queries");
const {
    paramsValidation,
    uuidValidator,
} = require("../../../others/validation");

module.exports = {
    addToCart: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["varientId", "customerId", "shopId", "count"],
        });
        uuidValidator(req.body.varientId.toString());
        uuidValidator(req.body.customerId.toString());
        const [check, details] = await CartQueries.addProductToCart(req.body);
        response.success = true;
        response.data = details;
        if (!check) {
            response.description = "Already add to Cloud cart";
        } else {
            response.description = "Add to Cloud cart successfully";
        }
    },
    removeFromCart: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["varientId", "shopId", "customerId"],
        });
        uuidValidator(req.body.varientId.toString());
        uuidValidator(req.body.customerId.toString());
        const [check, details] = await CartQueries.removeProductToCart(
            req.body,
        );
        response.success = check;
        response.data = details;
        if (!response.success) {
            response.description = "Does not exists in cloud cart";
        } else {
            response.description = "Remove from cloud cart successfully";
        }
    },
    getCart: async (req, response) => {
        const { cid } = req.params;
        const { lat, lng } = req.query;
        uuidValidator(cid.toString());
        let [details, payment] = await CartQueries.getCartForCustomer(
            cid,
            lat,
            lng,
        );
        response.success = true;
        response.payment = payment;
        response.data = details;

        if (details.length == 0) {
            response.description = "Cart is Empty";
        } else {
            response.description = "Cart fetch successfully";
        }
    },
    removeAllFromCart: async (req, response) => {
        const result = await CartQueries.removeAllProductToCart(
            req.params.customerId,
        );
        response.success = true;
        response.data = result;
    },
    checkShopInCart: async (req, response) => {
        const { cid, sid } = req.query;
        paramsValidation({
            params: ["cid", "sid"],
            body: req.query,
        });
        uuidValidator(cid);
        response.data = {
            existInShop: await CartQueries.checkShopInCart(cid, sid),
        };
        response.success = true;
    },
};
