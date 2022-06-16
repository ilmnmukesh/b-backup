const {
    sequelize,
    Transaction,
    Varient,
    Product,
    Shop,
    CloudWallet,
    Multipler,
    CloudCart,
    CloudOrder,
    CloudOrderProduct,
    Post,
} = require("../../../database");
const {
    sequelizeLiteralCloudCartPrice,
    sequelizeLiteralCloudCartProductCode,
} = require("../../../others/distance");
const { ENUM_TYPE } = require("../../../others/payment");

module.exports = {
    createOrder: async (data) => {
        const orderCreateQuery = async (cid) => {
            let res = await Shop.findAll({
                attributes: ["id", "name", "latitude", "longitude"],
                include: [
                    {
                        model: CloudCart,
                        attributes: [
                            "id",
                            "count",
                            [sequelizeLiteralCloudCartPrice(), "price"],
                            [sequelizeLiteralCloudCartProductCode(), "code"],
                        ],
                        include: {
                            model: Varient,
                            include: [
                                {
                                    model: Product,
                                    attributes: ["id", "name", "image"],
                                },
                                {
                                    model: Multipler,
                                    attributes: ["id", "value"],
                                },
                            ],
                            attributes: ["id"],
                        },
                        where: { customerId: cid },
                        required: true,
                    },
                ],
            });
            res = JSON.parse(JSON.stringify(res));
            return res;
        };
        const orderCreateCalculation = async (res, cnv) => {
            let len = res.length;
            let total = 0;
            let extra = Math.floor((cnv / len) * 100) / 100;
            for (const shop of res) {
                let payment = {
                    subTotal: 0,
                    convenienceFee: extra,
                    totalAmount: extra,
                };
                shop?.cloud_carts?.forEach((cartItem) => {
                    payment.subTotal += cartItem.count * cartItem.price;
                });
                payment.totalAmount += Math.floor(payment.subTotal * 100) / 100;
                shop.payment = payment;
                total += payment.totalAmount;
            }
            return [res, total];
        };
        const orderTransaction = async (res, opt) => {
            const txn = await Transaction.create({
                customerId: opt.customerId,
                amount: opt.amount,
                txnClientId: opt.referenceId,
                orderFor: ENUM_TYPE.CLOUD_ORDER,
            });
            let result = [];
            for (let shop of res) {
                const transaction = await sequelize.transaction();
                try {
                    let order = await CloudOrder.create(
                        {
                            shopId: shop.id,
                            customerId: opt.customerId,
                            referenceId: opt.referenceId,
                            transactionId: txn.id,
                            ...shop.payment,
                        },
                        { transaction },
                    );

                    // let taxTransaction = {
                    //     transaction_id: txn.id,
                    //     transaction_date: new Date(),
                    //     to_country: profile?.countryCode,
                    //     to_zip: profile?.postalCode,
                    //     to_state: profile?.stateCode,
                    //     amount: shop?.payment?.subTotal,
                    //     shipping: shop?.payment?.shippingCost,
                    //     sales_tax: shop?.payment?.taxes,
                    //     //line_items: [],
                    // };

                    for (let cartItem of shop.cloud_carts) {
                        await CloudOrderProduct.create(
                            {
                                price: cartItem.price,
                                quantity: cartItem.count,
                                image: cartItem.varient.product.image,
                                name: cartItem.varient.product.name,
                                noOfShots: cartItem.varient.multipler.value,
                                cloudOrderId: order.id,
                                varientId: cartItem.varient.id,
                            },
                            { transaction },
                        );
                        let walletCheck = await CloudWallet.findOne({
                            where: {
                                varientId: cartItem.varient.id,
                                customerId: opt.customerId,
                            },
                        });
                        let shots =
                            cartItem.count * cartItem.varient.multipler.value;
                        if (walletCheck === null) {
                            const post = await Post.findOne({
                                where: {
                                    shopId: shop.id,
                                    varientId: cartItem.varient.id,
                                },
                            });
                            await CloudWallet.create(
                                {
                                    noOfShots: shots,
                                    shotsLeft: shots,
                                    varientId: cartItem.varient.id,
                                    productId: cartItem.varient.product.id,
                                    customerId: opt.customerId,
                                    productPostId: post.id,
                                },
                                { transaction },
                            );
                        } else {
                            walletCheck.increment(
                                ["noOfShots", "shotsLeft"],
                                {
                                    by: shots,
                                },
                                { transaction },
                            );
                        }
                    }

                    await CloudCart.destroy(
                        {
                            where: {
                                customerId: opt.customerId,
                                shopId: shop.id,
                            },
                        },
                        { transaction },
                    );
                    result.push(order);
                    // await createTransactionOrder(taxTransaction);
                    await transaction.commit();
                } catch (e) {
                    console.log(e);
                    await transaction.rollback();
                }
            }
            return result;
        };
        const { customerId: cid } = data;
        let res = await orderCreateQuery(cid);
        let total;
        [res, total] = await orderCreateCalculation(res, 4.99);
        data.totalAmount = total;
        return await orderTransaction(res, data);
    },
    getOrder: async (customerId) => {
        return await CloudOrder.findAll({
            where: { customerId: customerId },
            include: [
                {
                    model: CloudOrderProduct,
                },
                Shop,
            ],
        });
    },
};
