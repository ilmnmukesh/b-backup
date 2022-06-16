const { Stripe } = require("stripe");
const { Customer } = require("../../database");

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
    apiVersion: "2020-08-27",
});

const createPaymentIntent = async (amount, customerId) => {
    const client = await stripe.paymentIntents.create({
        amount: parseInt(amount),
        currency: "usd",
        payment_method_types: ["card"],
        customer: customerId,
        transfer_group: "test",
    });
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: "2020-08-27" },
    );
    return { ephemeralKey, client };
};
const getPaymentIntent = async (pi) => {
    return await stripe.paymentIntents.retrieve(pi);
};
const createCustomerPaymentId = async (customer) => {
    let customerDetails = await stripe.customers.create({
        email: customer.email,
        phone: customer.phone,
        name: customer.firstName + " " + customer.lastName,
    });
    customer.paymentId = customerDetails.id;
    customer.save();
    return customerDetails.id;
};
const createOrGetCustomerPaymentId = async (customerId) => {
    let customer = await Customer.findByPk(customerId);
    if (customer == null) throw "Customer not Found";
    if (
        customer?.paymentId == null ||
        customer?.paymentId === "" ||
        customer?.paymentId === undefined
    ) {
        return createCustomerPaymentId(customer);
    }
    try {
        let customerDetails = await stripe.customers.retrieve(
            customer.paymentId,
        );
        return customerDetails.id;
    } catch (e) {
        return createCustomerPaymentId(customer);
    }
};

const createPaymentIntentSubscription = async (
    amount,
    customerId,
    metadata,
) => {
    const client = await stripe.paymentIntents.create({
        amount: parseInt(amount),
        currency: "usd",
        payment_method_types: ["card"],
        customer: customerId,
        metadata,
    });
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: "2020-08-27" },
    );
    return { ephemeralKey, client };
};

const createPaymentIntentWithMeta = async (amount, customerId, metadata) => {
    const client = await stripe.paymentIntents.create({
        amount: parseInt(amount),
        currency: "usd",
        payment_method_types: ["card"],
        customer: customerId,
        capture_method: "manual",
        metadata,
    });
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: "2020-08-27" },
    );
    return { ephemeralKey, client };
};

module.exports = {
    createPaymentIntent,
    createOrGetCustomerPaymentId,
    getPaymentIntent,
    createPaymentIntentWithMeta,
    createPaymentIntentSubscription,
};

// stripe.transfers.create({
//     amount: 700,
//     currency: "usd",
//     destination: "acct_1KUruV2ZY3pCYlSu",
//     transfer_group: "test",
// }).then(console.log).catch(console.log);

// stripe.balance.retrieve(function(err, balance) {console.log(JSON.stringify(balance, undefined, 4))});

// stripe.balance.retrieve(function(err, balance) {
//     console.log(JSON.stringify(balance, undefined, 4))
//   });
