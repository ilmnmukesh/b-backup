const {
    CloudWallet,
    CloudHistory,
    Varient,
    Product,
    Unit,
    Op,
    sequelize,
    Shop,
    Post,
    Partner,
    Category,
} = require("../../../database");
const { createQRurl } = require("../qr");
const moment = require("moment");
const { randomAlphaNum } = require("../../../others/alphanum");

module.exports = {
    getCustomerWallet: async (customerId, limit = null) => {
        let obj = await CloudWallet.findAll({
            where: { customerId },
            attributes: {
                include: [[sequelize.col(`value`), "unit"]],
            },
            include: [
                {
                    model: Post,
                    attributes: ["id"],
                    include: {
                        model: Shop,
                        attributes: ["id", "name"],
                        include: { model: Partner, attributes: ["id"] },
                    },
                },
                {
                    model: Product,
                    attributes: ["name", "image"],
                    include: {
                        model: Category,
                        where: { name: { [Op.iLike]: "%partner combo%" } },
                        required: false,
                    },
                },
                { model: Varient, attributes: [], include: Unit },
            ],
            limit,
        });
        obj = JSON.parse(JSON.stringify(obj));
        for (let o of obj) {
            o.isPartnerCombo = false;
            if (o.product.category != null) {
                o.isPartnerCombo = true;
                o.partnerId = o.product_post.shop.partner?.id;
                o.partnerName = o.product_post.shop.name;
            }
        }
        return obj;
    },
    getWallet: async (customerId, varientId) => {
        return await CloudWallet.findOne({
            where: { customerId, varientId },
            include: [
                { model: Product, attributes: ["name", "image"] },
                Varient,
            ],
        });
    },
    createQRWithHistory: async (cwId, customerId) => {
        const cloudWallet = await CloudWallet.findOne({
            where: { customerId, id: cwId },
        });
        if (cloudWallet.shotsLeft == 0) throw "No more shot left";
        if (cloudWallet == null) throw "Invalid Cloud Wallet";
        let exp = moment().add(1, "minutes").format("X");
        let randStr = randomAlphaNum();
        const ch = await CloudHistory.create({
            noOfShots: 1,
            cloudWalletId: cloudWallet.id,
            expiresIn: exp,
            alphaNum: randStr[0],
        });
        const [dataURL, url] = await createQRurl(ch.id, exp, randStr[0]);
        return [ch.id, dataURL, url, randStr[1]];
    },
    getCurrentHistory: async (id) => {
        let hist = await CloudHistory.findByPk(id, {
            include: { model: CloudWallet, include: [Varient, Product] },
        });
        if (
            hist.status === "processing" &&
            Date.now() / 1000 > hist.expiresIn
        ) {
            hist.status = "expires";
        }
        await hist.save();
        return hist;
    },
    updateHistoryStatus: async (id, status) => {
        let ch = await CloudHistory.findByPk(id);
        if (ch == null) throw "History id does not exists";
        if (!["expires", "redeem", "cancel"].includes(status))
            throw "Status is invalid";
        ch.status = status;
        if (status == "redeem") {
            let wallet = await ch.getCloud_wallet();
            if (wallet.shotsLeft == 0) return ch;
            wallet.shotsLeft -= ch.noOfShots;
            wallet.save();
        }
        await ch.save();
        return ch;
    },
    checkStatus: async (chId, cid) => {
        let res = await CloudHistory.findByPk(chId, {
            attributes: ["id", "status", "expiresIn", "cloudWalletId"],
            include: {
                model: CloudWallet,
                where: { customerId: cid },
                attributes: [],
                required: true,
            },
        });
        if (res == null) throw "Customer not assoicated";
        if (res.status == "processing" && Date.now() / 1000 > res.expiresIn) {
            res.status = "expires";
            await res.save();
        }
        return res;
    },
    updateStatus: async (chId, cid, opt = 1) => {
        let res = await CloudHistory.findByPk(chId, {
            attributes: ["id", "status", "expiresIn", "cloudWalletId"],
            include: {
                model: CloudWallet,
                where: { customerId: cid },
                attributes: [],
                required: true,
            },
        });
        if (res == null) throw "Customer not assoicated";
        if (res.status != "redeem" && opt == 1) res.status = "cancel";
        else if (res.status != "redeem" && opt == 2) res.status = "expires";
        else throw "QR already redeemed";
        await res.save();
        return res;
    },
    searchWallet: async (q, customerId) => {
        return await CloudWallet.findAll({
            where: { customerId },
            include: [
                {
                    model: Product,
                    attributes: ["name", "image"],
                    where: {
                        name: {
                            [Op.iLike]: `%${q}%`,
                        },
                    },
                },
            ],
            logging: console.log,
        });
    },
};
