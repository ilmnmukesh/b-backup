const CART = "/cart";

module.exports = {
    get: {
        getCart: `${CART}/get/:cid/`,
        checkShopInCart: `${CART}/check/`,
        getCartWithCheckout: `${CART}/details/:cid/`,
        getCartCheckout: `${CART}/checkout/:cid/`,
    },
    post: {
        addToCart: `${CART}/add/`,
        removeFromCart: `${CART}/remove/`,
        removeAllCartBasedOnShop: `${CART}/remove/shops/`,
        removeAllFromCart: `${CART}/remove/:customerId/`,
    },
};
