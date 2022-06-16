const { KitchenMenuQueires, KitchenCartQueires } = require("../queries");
const {
    paramsValidation,
    uuidValidator,
} = require("../../../others/validation");

module.exports = {
    moveToKitchenDashboard: async (req, response) => {
        const { pid } = req.query;
        response.data = {
            types: await KitchenMenuQueires.getPartnerMenuType(pid),
            items: [],
        };

        if (response.data.types.length != 0) {
            response.data.items = await KitchenMenuQueires.getPartenerMenuItems(
                pid,
                response.data.types[0].id,
            );
        }
        response.success = true;
    },
    moveToKitchenTypeBasedFetch: async (req, response) => {
        const { pid, mid } = req.query;
        response.data = await KitchenMenuQueires.getPartenerMenuItems(pid, mid);
        response.success = true;
    },

    moveToKitchenItemSearch: async (req, response) => {
        const { pid, q } = req.query;
        response.data = await KitchenMenuQueires.searchMenuItemsName(pid, q);
        response.success = true;
    },
    addToKitchenCart: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["customerId", "partnerId", "tableNo", "items", "wallets"],
        });
        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        if (!isNumber(req.body.tableNo)) {
            throw "tableNo is not a valid number";
        }
        const { customerId, partnerId, items, wallets } = req.body;
        if (!Array.isArray(items)) throw "Items required arrays";
        if (!Array.isArray(wallets)) throw "Wallets required arrays";

        for (const item of items) {
            paramsValidation({
                body: item,
                params: ["count", "itemId"],
            });
        }
        for (const wallet of wallets) {
            paramsValidation({
                body: wallet,
                params: ["walletId", "noOfShots"],
            });
        }
        response.data = {
            items: await KitchenCartQueires.addToCart(customerId, items),
            wallets: await KitchenCartQueires.reduceWallet(
                customerId,
                partnerId,
                wallets,
            ),
        };
        response.success = true;
    },
    moveToKitchenItemCheckOut: async (req, response) => {
        paramsValidation({
            body: req.query,
            params: ["cid", "pid"],
        });
        uuidValidator(req.query.cid);
        const { cid, pid } = req.query;
        response.data = await KitchenCartQueires.checkout(cid, pid);
        response.success = true;
    },

    getKitchenOrders: async (req, response) => {
        response.data = await KitchenCartQueires.getOrders(req.query.cid);
        response.success = true;
    },
    moveToKitchenCartCheck: async (req, response) => {
        response.success = true;
        const cart = await KitchenCartQueires.checkCart(req.query.cid);
        if (cart.length != 0) {
            response.cartNull = false;
            response.details = cart[0].menu_item.partner;
            response.description = "Cart may not empty, Kindly pay them.";
        } else {
            response.cartNull = true;
            response.description = "Cart is empty";
        }
    },
};
