const { Stripe } = require("stripe");
const { SellerAuth } = require("../../database");

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
    apiVersion: "2020-08-27",
});

const createSellerPaymentId = async (seller) => {
    let sellerDetails = await stripe.accounts.create({
        type: "express",
    });
    seller.accountId = sellerDetails.id;
    seller.save();
    return seller.accountId;
};
const createOrGetSellerPaymentId = async (id) => {
    let seller = await SellerAuth.findByPk(id);
    if (seller == null) throw "seller not Found";
    if (
        seller?.accountId == null ||
        seller?.accountId === "" ||
        seller?.accountId === undefined
    ) {
        return createSellerPaymentId(seller);
    }
    try {
        return seller.accountId;
    } catch (e) {
        return createSellerPaymentId(seller);
    }
};

const createAccountLink = async (authId) => {
    const accId = await createOrGetSellerPaymentId(authId);
    const details = await stripe.accountLinks.create({
        account: accId,
        refresh_url: process.env.HOST + "/dashboard/logout",
        return_url: process.env.HOST + "/dashboard/connect/update/",
        type: "account_onboarding",
    });

    return details.url;
};

const createLoginLink = async (authId) => {
    const accId = await createOrGetSellerPaymentId(authId);
    const details = await stripe.accounts.createLoginLink(accId);

    return details.url;
};

const getAccountDetails = async (authId) => {
    const accId = await createOrGetSellerPaymentId(authId);
    return await stripe.accounts.retrieve(accId);
};

const updateSellerVerified = async (shopId, isVerified) => {
    await SellerAuth.update({ isVerified }, { where: { shopId } });
};

module.exports = {
    getAccountDetails,
    createAccountLink,
    createLoginLink,
    updateSellerVerified,
};
