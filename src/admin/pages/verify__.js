const { validateQR } = require("../../mobile/cloud/qr");
const { WalletQueries } = require("../../mobile/cloud/queries");

const StatusHandler = async (req, res, context) => {
    const { chId, status } = req.payload;
    console.log(chId, status);
    let resp = {
        success: true,
        details: {},
    };
    try {
        let s;
        switch (parseInt(status)) {
            case 1:
                s = "expires";
                break;
            case 2:
                s = "redeem";
                break;
            case 3:
                s = "cancel";
                break;
            default:
                throw "Invalid status";
        }
        console.log("asds");
        resp.details = await WalletQueries.updateHistoryStatus(chId, s);
    } catch (error) {
        console.log(error);
        resp.error = error.message;
        resp.success = false;
    }
    return resp;
};
// module.exports = (AdminBro) => ({
//     label: "verify",
//     handler: async (req, res, context) => {
//         if (req?.payload?.opt == 1) {
//             return await StatusHandler(req, res, context);
//         }
//         const { currentAdmin } = context;
//         const { cloudHistory, token, secret, time } = req.payload;
//         const check = await validateQR(secret, token);
//         let hist = await WalletQueries.getCurrentHistory(cloudHistory);
//         if (currentAdmin.shopId !== hist.shopId) {
//             return { data: false, details: {} };
//         }
//         if (check || time > new Date() / 1000) {
//             return {
//                 data: true,
//                 details: hist,
//             };
//         }
//         return { data: false, details: hist };
//     },
//     component: AdminBro.bundle("../views/verify"),
// });

module.exports = (AdminBro) => ({
    label: "verify",
    handler: async (req, res, context) => {
        return { data: false };
    },
    component: AdminBro.bundle("../views/verify"),
});
