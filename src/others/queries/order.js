const {
    Transaction,
    Order,
    OrderProduct,
    Varient,
    sequelize,
    Shop,
    Product,
    ShippingDetails,
    OrderCancel,
    Cart,
    ProfileInfo,
    DeliveryType,
} = require("../../database");
const {
    sequelizeLiteralCartPrice,
    sequelizeLiteralCartProductCode,
    sequelizeLiteralCartTenAddOne,
} = require("../distance");
const moment = require("moment");
const { getPaymentIntent } = require("../payment");
const { calculateTaxAmount } = require("../taxjar");
const { findCustomerMembershipCartInfo } = require("./membership");
const { deliveryCalOrder } = require("../delivery");
const { scheduleCaptureAmount } = require("../schedule");

const OrderQuery = {
    getVarient: async (pk) => {
        return await Varient.findByPk(pk, {
            include: [{ model: Product, include: Shop }],
        });
    },
    createOrder: async (data) => {
        const {
            customerId: cid,
            profileId: pid,
            referenceId: ref,
            tipForDriver: tfd,
            extraId: extra,
        } = data;

        let [isDelivery, memberShip] = await findCustomerMembershipCartInfo(
            cid,
        );
        let dtype = await DeliveryType.findByPk(extra);
        let price = parseFloat(dtype.price);
        let standardDetails = await DeliveryType.findOne({
            where: { name: "Standard" },
        });
        const STANDARDCOST = parseFloat(standardDetails.price);
        const DELIVERYCOST = memberShip?.deliveryCharge ? STANDARDCOST : 0;
        const EXTRA = extra != 1 ? price - STANDARDCOST : 0;
        const CONVENIENCE = 4.99;

        const addOneLogic = (x, y) => {
            if (dtype.deliveryCharge) return false;
            return (x % 11) + y >= 11;
        };
        const orderCreateQuery = async (cid, pid) => {
            let res = await Shop.findAll({
                attributes: [
                    "id",
                    "name",
                    "latitude",
                    "longitude",
                    "openTime",
                    "closeTime",
                ],
                include: [
                    {
                        model: Cart,
                        attributes: [
                            "id",
                            "count",
                            [sequelizeLiteralCartPrice(), "price"],
                            [sequelizeLiteralCartProductCode(), "code"],
                            [
                                sequelizeLiteralCartTenAddOne(cid),
                                "already_order",
                            ],
                        ],
                        include: {
                            model: Varient,
                            include: [
                                {
                                    model: Product,
                                    attributes: ["name", "image"],
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

            return [res, await ProfileInfo.findByPk(pid)];
        };
        const orderCreateCalculation = async (res, profile, tfd, cnv) => {
            let len = res.length;
            let total = 0;
            for (const shop of res) {
                let payment = {
                    subTotal: 0,
                    shippingCost: 0,
                    taxes: 0,
                    extra: EXTRA,
                    tipForDriver: tfd / len,
                    convenienceFee: cnv / len,
                    totalAmount: tfd / len + cnv / len,
                };
                let params = {
                    to_country: profile.countryCode,
                    to_zip: profile.postalCode,
                    to_state: profile.stateCode,
                    shipping: DELIVERYCOST,
                    line_items: [],
                };
                shop?.carts?.forEach((cartItem) => {
                    let addOne = addOneLogic(
                        parseInt(cartItem.already_order),
                        cartItem.count,
                    );
                    let cnt = addOne ? cartItem.count - 1 : cartItem.count;
                    payment.subTotal += cnt * cartItem.price;
                    params.line_items.push({
                        id: cartItem.id,
                        quantity: cnt,
                        unit_price: cartItem.price,
                        product_tax_code: cartItem.code,
                    });
                });
                payment.taxes = (
                    await calculateTaxAmount(params)
                ).tax.amount_to_collect;
                payment.totalAmount +=
                    Math.floor(
                        (DELIVERYCOST +
                            parseFloat(EXTRA) +
                            payment.taxes +
                            payment.subTotal) *
                            100,
                    ) / 100;
                payment.shippingCost = DELIVERYCOST;
                shop.payment = payment;
                total += payment.totalAmount;
            }
            return [res, total];
        };
        const orderTransaction = async (res, opt) => {
            const txn = await Transaction.create({
                customerId: opt.customerId,
                amount: opt.totalAmount,
                txnClientId: opt.referenceId,
            });
            let result = [];
            for (let shop of res) {
                const transaction = await sequelize.transaction();
                try {
                    const txnFee = (
                        (shop.payment.totalAmount / 100) * 2.9 +
                        0.3
                    ).toFixed(2);
                    let order = await Order.create(
                        {
                            shopId: shop.id,
                            customerId: opt.customerId,
                            referenceId: opt.referenceId,
                            transactionId: txn.id,
                            txnFee,
                            // orderAccepted: true,
                            estimateDelivery: deliveryCalOrder(
                                shop.openTime,
                                shop.closeTime,
                                memberShip.deliveryWithin,
                                opt.lat,
                                opt.lng,
                                dtype?.period ? 1 : dtype?.period,
                            ),
                            ...shop.payment,
                        },
                        { transaction },
                    );
                    let profile = JSON.parse(
                        JSON.stringify(
                            await ProfileInfo.findByPk(opt.profileId, {
                                attributes: [
                                    "city",
                                    "address",
                                    "state",
                                    "name",
                                    "country",
                                    "postalCode",
                                ],
                            }),
                        ),
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
                    await ShippingDetails.create(
                        { ...profile, orderId: order.id },
                        { transaction },
                    );

                    for (const cartItem of shop.carts) {
                        let addOne = addOneLogic(
                            parseInt(cartItem.already_order),
                            cartItem.count,
                        );
                        await OrderProduct.create(
                            {
                                price: cartItem.price,
                                isOffer: addOne,
                                quantity: cartItem.count,
                                image: cartItem.varient.product.image,
                                name: cartItem.varient.product.name,
                                orderId: order.id,
                                varientId: cartItem.varient.id,
                                isSubscription: !isDelivery,
                            },
                            { transaction },
                        );
                    }

                    await Cart.destroy(
                        {
                            where: {
                                customerId: opt.customerId,
                                shopId: shop.id,
                            },
                        },
                        { transaction },
                    );
                    // await createTransactionOrder(taxTransaction);
                    await transaction.commit();
                    result.push(
                        await Order.findByPk(order.id, {
                            include: [
                                ShippingDetails,
                                {
                                    model: OrderProduct,
                                    include: [
                                        {
                                            model: Varient,
                                            attributes: ["productId", "volume"],
                                        },
                                    ],
                                },
                            ],
                        }),
                    );
                } catch (e) {
                    console.log(e);
                    await transaction.rollback();
                }
            }
            if (result.length != 0) {
                await scheduleCaptureAmount(
                    opt.referenceId,
                    new Date(moment().add({ minutes: 30 })),
                );
            }
            return result;
        };

        let [res, profile] = await orderCreateQuery(cid, pid);
        [res, total] = await orderCreateCalculation(
            res,
            profile,
            tfd,
            CONVENIENCE,
        );

        data.totalAmount = total;
        data.lat = profile.latitude;
        data.lng = profile.longitude;
        return await orderTransaction(res, data);
    },
    getOrder: async (customerId) => {
        let order = await Order.findAll({
            where: { customerId: customerId },
            include: [
                {
                    model: OrderProduct,
                },
                ShippingDetails,
                Shop,
                OrderCancel,
            ],
        });
        order = JSON.parse(JSON.stringify(order));
        for (x of order) {
            x.estimateDelivery = moment(x.estimateDelivery).format(
                "dddd, MMMM Do YYYY, h:mma",
            );
            x.createdAt = moment(x.createdAt).format(
                "dddd, MMMM Do YYYY, h:mma",
            );
        }
        return order;
    },
    calculateAmount: async (data) => {
        let details = {
            subTotal: 0,
            shippingCost: 40,
            taxes: 0,
            convenience: 0,
            total: 0,
        };
        for (let i = 0; i < data.length; i++) {
            let e = data[i];
            let res = await Varient.findByPk(e.varientId);
            details.subTotal += res.sellingPrice * e.quantity;
        }
        details.taxes = Math.round((details.subTotal / 100) * 7.5 * 100) / 100;
        details.total =
            details.subTotal +
            details.shippingCost +
            details.taxes +
            details.convenience;
        details.total = Math.round(details.total * 100) / 100;
        return details;
    },
    cancelOrder: async (orderId, reason) => {
        let res = await Order.findByPk(orderId, {
            include: [OrderProduct],
        });
        res.status = "cancelled";
        res.save();
        return await OrderCancel.create({
            reason: reason,
            amount: res.subTotal,
            orderId: res.id,
        });
    },
    getTransaction: async (customerId) => {
        return await Transaction.findAll({
            where: { customerId: customerId },
            //include: Order,
        });
    },
};
module.exports = OrderQuery;
