const { Stripe } = require("stripe");

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
    apiVersion: "2020-08-27",
});

const acceptCapture = async (amount, paymentId) => {
    await stripe.paymentIntents.capture(paymentId, {
        amount_to_capture: amount,
    });
};

const cancelCapture = async (paymentId) => {
    await stripe.paymentIntents.cancel(paymentId);
};

const transferAmount = async (amount, accountId, paymentId) => {
    await stripe.transfers.create({
        currency: "usd",
        amount,
        destination: accountId,
        transfer_group: paymentId,
    });
};

module.exports = { acceptCapture, cancelCapture, transferAmount };
