const { WalletQueries } = require("../queries");
const {
    uuidValidator,
    paramsValidation,
} = require("../../../others/validation");

module.exports = {
    getCustomerWallet: async (req, response) => {
        const { cid: customerId } = req.params;
        uuidValidator(customerId);
        response.success = true;
        response.data = await WalletQueries.getCustomerWallet(customerId);
    },
    getWallet: async (req, response) => {
        const { vid, cid } = req.query;
        paramsValidation({ body: req.query, params: ["vid", "cid"] });
        uuidValidator(cid);
        uuidValidator(vid);
        response.data = await WalletQueries.getWallet(cid, vid);
        response.success = true;
    },
    generateQRCode: async (req, response) => {
        const { id } = req.params;
        const { cid } = req.query;
        paramsValidation({ body: req.query, params: ["cid"] });
        uuidValidator(cid);
        const [chid, dataURL, img, randStr] =
            await WalletQueries.createQRWithHistory(id, cid);
        response.data = {
            historyId: chid,
            dataURL: dataURL,
            //url: process.env.HOST + "/qrcode?d=" + dataURL,
            img: img,
            alphaNumberic: randStr,
        };
        response.success = true;
    },
    checkQRProcess: async (req, response) => {
        const { chid } = req.params;
        const { cid } = req.query;
        paramsValidation({ body: req.query, params: ["cid"] });
        uuidValidator(cid);
        response.data = await WalletQueries.checkStatus(chid, cid);
        response.success = true;
    },
    updateQRStatus: async (req, response) => {
        const { chid } = req.params;
        const { customerId: cid, options: opt } = req.body;
        paramsValidation({ body: req.body, params: ["customerId", "options"] });
        uuidValidator(cid);
        response.data = await WalletQueries.updateStatus(
            chid,
            cid,
            opt ? opt : 1
        );
        response.success = true;
    },
    searchCustomerWallet: async (req, response) => {
        const { q, cid } = req.query;
        paramsValidation({ body: req.query, params: ["cid"] });
        uuidValidator(cid);
        response.data = await WalletQueries.searchWallet(q ? q : "", cid);
        response.success = true;
    },
};
