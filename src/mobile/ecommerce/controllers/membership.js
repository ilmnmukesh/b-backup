const { MemberQueries } = require("../../../others/queries");
const { paramsValidation } = require("../../../others/validation");
const moment = require("moment");
module.exports = {
    getMembership: async (request, response) => {
        const { cid } = request.query;
        response.data = await MemberQueries.getMembershipDetails(cid);
        response.success = true;
    },

    changeMembership: async (request, response) => {
        paramsValidation({
            body: request.body,
            params: ["customerId", "premiumId"],
        });
        const { customerId, premiumId } = request.body;
        response.data = await MemberQueries.changeMemberShip(
            customerId,
            premiumId,
        );
        response.success = true;
    },

    getMembershipDesc: async (request, response) => {
        const { cid } = request.query;
        response.data = {};
        const custSub = await MemberQueries.getCustomerSubscription(cid);
        const isExpired =
            Date.now() > new Date(custSub?.expires_date).getTime();
        if (custSub && custSub.premiumId != 1 && isExpired) {
            await MemberQueries.changeMemberShip(cid, 1, true);
        }
        let data = await MemberQueries.getMembershipById(2);
        response.data.customer = {
            isExpired,
            level: custSub.premium.level,
            valid: moment(custSub?.expires_date).format(
                "dddd, MMMM Do YYYY, h:mma",
            ),
            upgrade: data,
        };

        response.data.details = [
            {
                image: `${process.env.HOST}/images/icons/1.png`,
                description: `Consumer will be allowed to have maximum of ${data.shotLimit} drinks at a given place on a given day for cloud redemption.`,
            },
            {
                image: `${process.env.HOST}/images/icons/2.png`,
                description: `There will be No delivery charges for standard delivery orders. `,
            },
            {
                image: `${process.env.HOST}/images/icons/3.png`,
                description: `They will be ${data.coinDiscount}% discount for Boozeo coin purchase orders.`,
            },
            {
                image: `${process.env.HOST}/images/icons/4.png`,
                description: `Consumers will still pay for expedited and Rushed deliveries.`,
            },
            {
                image: `${process.env.HOST}/images/icons/5.png`,
                description: `Free Liquor bottle after 10 orders for same brand and type.`,
            },
            {
                image: `${process.env.HOST}/images/icons/6.png`,
                description: `${data.description} Only partner sponsored content in virtual environment`,
            },
        ];

        response.success = true;
    },

    getDeliveryType: async (request, response) => {
        paramsValidation({
            body: request.query,
            params: ["cid"],
        });
        const { cid } = request.query;
        let type = JSON.parse(
            JSON.stringify(await MemberQueries.deliveryTypes()),
        );
        let [charge, member] =
            await MemberQueries.findCustomerMembershipCartInfo(cid);
        const DELIVERY_COST = type.length > 0 ? type[0].price : 4.99;

        for (x of type) {
            if (!charge) {
                x.price = (parseFloat(x.price) - DELIVERY_COST).toFixed(2);
            }
        }
        response.data = {
            deliveryType: type,
            customerMembership: member,
        };
        response.success = true;
    },
};
