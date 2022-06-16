const ORDER = "/order";

module.exports = {
    get: {
        getCloudOrder: `${ORDER}/get/:cid/`,
    },
    post: {
        createCloudOrder: `${ORDER}/create/`,
    },
};
