const BASE = "/kitchen";

module.exports = {
    get: {
        moveToKitchenDashboard: `${BASE}/`,
        moveToKitchenTypeBasedFetch: `${BASE}/type`,
        moveToKitchenItemSearch: `${BASE}/search`,
        moveToKitchenItemCheckOut: `${BASE}/checkout`,
        getKitchenOrders: `${BASE}/orders`,
        moveToKitchenCartCheck: `${BASE}/cart/check`,
    },
    post: {
        addToKitchenCart: `${BASE}/cart`,
    },
};
