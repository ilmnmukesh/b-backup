const PAYMENT = "/payment";

module.exports = {
    get: {
        getPublishableKey: `${PAYMENT}/key/`,
    },
    post: {
        createPayment: `${PAYMENT}/client/`,
        createPaymentMetaData: `${PAYMENT}/client/details/`,
        createPaymentForSubscription: `${PAYMENT}/client/subscription/`,
        createPaymentForCloudMeta: `${PAYMENT}/client/cloud/`,
        createPaymentForKitchen: `${PAYMENT}/client/kitchen/`,
        createPaymentForEventReservation: `${PAYMENT}/client/event/`,
    },
};
