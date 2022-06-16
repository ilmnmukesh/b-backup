const VERIFY = "/verify";

module.exports = {
    get: {
        validateVerification: `${VERIFY}/check/:id/`,
    },
    post: {
        createVerification: `${VERIFY}/:id/`,
    },
};
