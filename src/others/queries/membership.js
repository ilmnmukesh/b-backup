const {
    Premium: Membership,
    Subscription,
    DeliveryType,
    Transaction,
} = require("../../database");
const moment = require("moment");
const { ENUM_TYPE } = require("../payment");
module.exports = {
    getMembershipDetails: async (cid = null) => {
        if (cid) {
            return await Membership.findAll({
                include: {
                    model: Subscription,
                    where: { customerId: cid },
                    required: false,
                },
            });
        }
        return await Membership.findAll();
    },
    findCustomerMembershipCartInfo: async (customerId) => {
        let member = await Membership.findOne({
            include: {
                model: Subscription,
                where: { customerId },
                required: true,
                attributes: [],
            },
        });
        if (member == null) return [true, {}];
        return [member.deliveryCharge, member];
    },
    deliveryTypes: async () => {
        return await DeliveryType.findAll();
    },
    changeMemberShip: async (cid, pid, free = false) => {
        let check = await Membership.findByPk(pid);
        if (!check) throw "Given premium id doesn't exists";
        let custMem = await Subscription.findOne({
            where: { customerId: cid },
        });
        if (free) {
            // let d = await Membership.findOne({
            //     where: { level: "free" },
            // })?.id;
            // custMem.premiumId = d ? d.id : custMem.premiumId;
            custMem.premiumId = 1;
        } else {
            custMem.premiumId = pid;
            custMem.expires_date = moment()
                .add(30, "days")
                .format("YYYY-MM-DD");
        }
        await custMem.save();
        return custMem;
    },
    getCustomerSubscription: async (customerId) => {
        return await Subscription.findOne({
            where: { customerId },
            include: [Membership],
        });
    },
    getMembershipById: async (id) => {
        return await Membership.findByPk(id);
    },
    membershipUpdate: async (txnClientId, customerId, amount) => {
        await Transaction.create({
            customerId,
            amount,
            txnClientId,
            orderFor: ENUM_TYPE.SUBCRIPTION,
        });
        let custMem = await Subscription.findOne({
            where: { customerId },
        });
        custMem.premiumId = 2;
        custMem.expires_date = moment().add(30, "days").format("YYYY-MM-DD");

        await custMem.save();
    },
};
