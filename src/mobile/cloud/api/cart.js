const CART = "/cart";

module.exports = {
    get: { getCart: `${CART}/get/:cid/`, checkShopInCart: `${CART}/check/` },
    post: {
        addToCart: `${CART}/add/`,
        removeFromCart: `${CART}/remove/`,
        removeAllFromCart: `${CART}/remove/:customerId/`,
    },
};
