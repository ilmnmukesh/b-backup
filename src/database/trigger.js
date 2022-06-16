module.exports = (db) => {
    db.Customer.addHook("afterCreate", async (customer, options) => {
        let prem = await db.Premium.findOne({
            where: { level: "free" },
        });
        if (prem) {
            await db.Subscription.create({
                expires_date: "2030-01-01",
                premiumId: prem.id,
                customerId: customer.id,
            });
        }
    });
    return {};
};
