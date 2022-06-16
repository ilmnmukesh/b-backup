const ORDER = "/order";

module.exports = {
    get: {
        getOrder: `${ORDER}/get/:customerId/`,
        getTransaction: `${ORDER}/transaction/:customerId/`,
    },
    post: {
        createOrder: `${ORDER}/create/`,
        cancelOrder: `${ORDER}/cancel/`,
    },
};
