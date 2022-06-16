const { CloudWallet } = require("../../database");

const cloudHistory = async (req, res, context) => {
    return await CloudWallet.findByPk(req?.payload?.cloudHistory);
};

module.exports = (AdminBro) => ({
    label: "verify",
    handler: async (req, res, context) => {
        return { data: false };
    },
    component: AdminBro.bundle("../views/verify"),
});
