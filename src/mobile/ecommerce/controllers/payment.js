const {
    createPaymentIntent,
    createPaymentIntentWithMeta,
    createOrGetCustomerPaymentId,
    createPaymentIntentSubscription,
    ENUM_TYPE,
} = require("../../../others/payment");
const { CartQueries, MemberQueries } = require("../../../others/queries");
const { paramsValidation } = require("../../../others/validation");

module.exports = {
    getPublishableKey: (_, response) => {
        response.data = { PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY };
        response.success = true;
    },
    createPayment: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["amount", "customerId"],
        });
        const { amount, customerId } = req.body;
        let payCustId = await createOrGetCustomerPaymentId(customerId);
        const { ephemeralKey, client } = await createPaymentIntent(
            amount * 100,
            payCustId,
        );
        response.data = {
            ref: client.id,
            client_secret: client.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: payCustId,
        };
        response.success = true;
    },
    createPaymentMetaData: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: [
                "amount",
                "customerId",
                "tipForDriver",
                "dtid",
                "profileId",
            ],
        });
        const { amount, customerId, profileId, dtid, tipForDriver } = req.body;
        const total = (
            await CartQueries.checkoutDetailsForMeta(req.body)
        ).toFixed(2);
        if (total != amount)
            throw `Given amount ${amount} and user details amount ${total} is not matching... `;
        const meta = {
            paymentFor: ENUM_TYPE.E_COM_ORDER,
            profileId,
            customerId,
            tipForDriver,
            extraId: dtid,
        };
        let payCustId = await createOrGetCustomerPaymentId(customerId);
        const { ephemeralKey, client } = await createPaymentIntentWithMeta(
            amount * 100,
            payCustId,
            meta,
        );
        response.data = {
            ref: client.id,
            client_secret: client.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: payCustId,
        };
        response.success = true;
    },
    createPaymentForSubscription: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["customerId"],
        });
        const { customerId } = req.body;
        const amount = (await MemberQueries.getMembershipById(2)).price;
        let payCustId = await createOrGetCustomerPaymentId(customerId);
        const meta = {
            paymentFor: ENUM_TYPE.SUBCRIPTION,
            customerId,
            amount,
        };
        const { ephemeralKey, client } = await createPaymentIntentSubscription(
            amount * 100,
            payCustId,
            meta,
        );
        response.data = {
            ref: client.id,
            client_secret: client.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: payCustId,
        };
        response.success = true;
    },
    createPaymentForCloudMeta: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["amount", "customerId"],
        });
        const { amount, customerId } = req.body;
        let payCustId = await createOrGetCustomerPaymentId(customerId);
        const meta = {
            paymentFor: ENUM_TYPE.CLOUD_ORDER,
            customerId,
            amountEnter: amount,
        };
        const { ephemeralKey, client } = await createPaymentIntentSubscription(
            amount * 100,
            payCustId,
            meta,
        );
        response.data = {
            ref: client.id,
            client_secret: client.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: payCustId,
        };
        response.success = true;
    },
    createPaymentForKitchen: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["amount", "tipForService", "customerId", "partnerId"],
        });
        const { amount, tipForService, partnerId, customerId } = req.body;
        let payCustId = await createOrGetCustomerPaymentId(customerId);
        const meta = {
            paymentFor: ENUM_TYPE.KITCHEN_ORDER,
            customerId,
            partnerId,
            tipForService,
        };
        const { ephemeralKey, client } = await createPaymentIntentSubscription(
            amount * 100,
            payCustId,
            meta,
        );
        response.data = {
            ref: client.id,
            client_secret: client.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: payCustId,
        };
        response.success = true;
    },
    createPaymentForEventReservation: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: [
                "amount",
                "noOfTickets",
                "customerId",
                "eventId",
                "registrar",
            ],
        });
        const { amount, noOfTickets, eventId, customerId, registrar } =
            req.body;
        let payCustId = await createOrGetCustomerPaymentId(customerId);
        const meta = {
            paymentFor: ENUM_TYPE.EVENT_BOOKING,
            customerId,
            eventId,
            noOfTickets,
            registrar,
        };
        const { ephemeralKey, client } = await createPaymentIntentSubscription(
            amount * 100,
            payCustId,
            meta,
        );
        response.data = {
            ref: client.id,
            client_secret: client.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: payCustId,
        };
        response.success = true;
    },
};
