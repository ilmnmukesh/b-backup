const SHOP = "/shop";

module.exports = {
    get: {
        shopState: `${SHOP}/state/`,
        shopDetails: `${SHOP}/details/:id/`,
        shopBasedCatProduct: `${SHOP}/products/:id/`,
        getShopReview: `${SHOP}/review/get/`,
    },
    post: {
        addShopReview: `${SHOP}/review/add`,
        contactSeller: `${SHOP}/contact/mail/`,
    },
};
