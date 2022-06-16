const {
    CloudHistory,
    CloudWallet,
    Product,
    Varient,
} = require("../../database");
const { WalletQueries } = require("../../mobile/cloud/queries");

const app = require("express")();

const Verification = {
    getCloudHistory: async (ch) => {
        return await CloudHistory.findByPk(ch, {
            include: {
                model: CloudWallet,
                attributes: ["id"],
                include: [Product, Varient],
            },
        });
    },
    updateStatus: async (ch, status) => {
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
        return await WalletQueries.updateHistoryStatus(ch, s);
    },
    searchWallet: async (q) => {
        return await CloudHistory.findOne({
            where: { alphaNum: q },
            include: {
                model: CloudWallet,
                attributes: ["id"],
                include: [Product, Varient],
            },
        });
    },
};

app.get("/verify/:ch/", async (req, res) => {
    let response = { success: true, data: {} };
    const { ch } = req.params;
    response.data = await Verification.getCloudHistory(ch);
    response.data = JSON.parse(JSON.stringify(response.data));
    response.data.approve =
        response.data.status == "processing" &&
        response.data.expiresIn * 1000 < Date.now();
    res.status(200).send(response);
    res.end();
});

app.get("/wallet/search", async (req, res) => {
    let response = { success: true, data: {} };
    const { q } = req.query;
    let result = await Verification.searchWallet(q);
    if (result == null) response.success = false;
    else {
        response.data = result;
        response.data = JSON.parse(JSON.stringify(response.data));
        response.data.approve =
            response.data.status == "processing" &&
            response.data.expiresIn * 1000 < Date.now();
    }
    res.status(200).send(response);
    res.end();
});

app.post("/update/history", async (req, res) => {
    let response = { success: true, data: {} };
    const { ch, status } = req.body;
    response.data = await Verification.updateStatus(ch, status);
    res.status(200).send(response);
    res.end();
});

module.exports = app;
