const {
    Cart,
    Varient,
    Product,
    Multipler,
    Unit,
    sequelize,
    ProfileInfo,
    Shop,
    Post,
    Subscription,
    Premium,
    DeliveryType,
} = require("../../database");
const {
    sequelizeLiteralTerinary,
    sequelizeLiteralDistance,
    sequelizeLiteralCartPrice,
    sequelizeLiteralMultipler,
    sequelizeLiteralCartProductCode,
    sequelizeLiteralCartTenAddOne,
} = require("../../others/distance");
const { calculateTaxAmount } = require("../taxjar");
const { deliveryCalWithExp } = require("../delivery");
const { findCustomerMembershipCartInfo } = require("./membership");

const locationQueries = (lat, lng) => ({
    getCartForCustomer: async (
        cid,
        pid,
        isDelivery,
        deliveryWithin,
        dtypes,
    ) => {
        const DELIVERYCOST = isDelivery ? 4.99 : 0;
        const CONVENIENCE = 4.99;

        let approve = true;
        let overAll = {
            subTotal: 0,
            shippingCost: 0,
            taxes: 0,
            convenience: 0,
            total: 0,
        };
        const getProfile = async () => {
            return await ProfileInfo.findByPk(pid);
        };
        const getCartDetails = async () => {
            return await Shop.findAll({
                attributes: [
                    "id",
                    "name",
                    "latitude",
                    "longitude",
                    "openTime",
                    "closeTime",
                    [sequelizeLiteralDistance(lat, lng), "distance"],
                    [sequelizeLiteralTerinary(lat, lng, false), "isAvailable"],
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
                                    attributes: ["id", "name", "image"],
                                },
                                { model: Unit, attributes: [] },
                                { model: Multipler, attributes: [] },
                            ],
                            attributes: [
                                "id",
                                "mrp",
                                // "image",
                                "volume",
                                "stock",
                                [sequelizeLiteralMultipler(), "multiplers"],
                            ],
                        },
                        where: { customerId: cid },
                        required: true,
                    },
                ],
                order: [[sequelize.col("distance"), "ASC"]],
            });
        };
        const calculation = async (lt, lg) => {
            for (const shop of res) {
                let payment = {
                    subTotal: 0,
                    shippingCost: 0,
                    taxes: 0,
                };
                let params;
                if (profile) {
                    params = {
                        to_country: profile.countryCode,
                        to_zip: profile.postalCode,
                        to_state: profile.stateCode,
                        shipping: DELIVERYCOST,
                        line_items: [],
                    };
                    if (!shop.isAvailable) approve = false;
                    shop.deliveryTime = deliveryCalWithExp(
                        shop.openTime,
                        shop.closeTime,
                        deliveryWithin,
                        lt,
                        lg,
                    );
                    for (const val of dtypes) {
                        shop[val.name] = deliveryCalWithExp(
                            shop.openTime,
                            shop.closeTime,
                            deliveryWithin,
                            lt,
                            lg,
                            val.period,
                        );
                    }
                    shop?.carts?.forEach((cartItem) => {
                        payment.subTotal += cartItem.count * cartItem.price;
                        params.line_items.push({
                            id: cartItem.id,
                            quantity: cartItem.count,
                            unit_price: cartItem.price,
                            product_tax_code: cartItem.code,
                        });
                    });

                    payment.taxes = (
                        await calculateTaxAmount(params)
                    ).tax.amount_to_collect;
                } else {
                    shop?.carts?.forEach((cartItem) => {
                        payment.subTotal += cartItem.count * cartItem.price;
                    });
                }
                payment.shippingCost = DELIVERYCOST;
                overAll.subTotal += payment.subTotal;
                overAll.taxes += payment.taxes;
                overAll.shippingCost += payment.shippingCost;
                shop.payment = {
                    subTotal: payment.subTotal.toFixed(2),
                    shippingCost: payment.shippingCost.toFixed(2),
                    taxes: payment.taxes.toFixed(2),
                };
            }
        };
        const updateCalculation = () => {
            overAll.convenience =
                overAll.subTotal != 0 ? CONVENIENCE.toString() : 0;
            overAll.total = (
                overAll.shippingCost +
                overAll.taxes +
                overAll.subTotal +
                (overAll.subTotal != 0 ? CONVENIENCE : 0)
            ).toFixed(2);
            overAll.shippingCost = overAll.shippingCost.toFixed(2);
            overAll.taxes = overAll.taxes.toFixed(2);
            overAll.subTotal = overAll.subTotal.toFixed(2);
        };

        let profile = await getProfile();
        if (profile === null) approve = false;
        else {
            const temp = [lat, lng];
            try {
                lat = profile?.latitude ? profile.latitude : lat;
                lng = profile?.longitude ? profile.longitude : lng;
            } catch (e) {
                console.log("In Cart", e);
                [lat, lng] = temp;
            }
        }
        let res = await getCartDetails();
        res = JSON.parse(JSON.stringify(res));
        if (res == null || res.length == 0) return [[], overAll, false];
        await calculation(lat, lng);
        updateCalculation();
        return [res, overAll, approve];
    },
});

const cartQueries = {
    async addProductToCart({ varientId, customerId, shopId, count }) {
        let check = await Post.findOne({
            where: { varientId: varientId, shopId: shopId },
        });
        if (check == null) throw "Shop does not have this product";
        let result = await Cart.findOne({
            where: {
                varientId: varientId,
                customerId: customerId,
                shopId: shopId,
            },
        });
        if (result == null) {
            result = await Cart.create({
                varientId: varientId,
                customerId: customerId,
                shopId: shopId,
                count: count,
            });
            return [true, result];
        }
        if (count < 1) return [false, result];
        result.count = count;
        result.save();
        return [false, result];
    },
    async removeProductToCart({ varientId, shopId, customerId }) {
        let result = await Cart.findOne({
            where: {
                varientId: varientId,
                customerId: customerId,
                shopId: shopId,
            },
        });
        if (result == null) {
            return [false, {}];
        }
        result.destroy();
        return [true, result];
    },
    async getCartForCustomer(
        cid,
        pid,
        lat = null,
        lng = null,
        isDelivery = true,
        dTime = 4,
        dtype = [],
    ) {
        if (lat && lng) {
            return await locationQueries(lat, lng).getCartForCustomer(
                cid,
                pid,
                isDelivery,
                dTime,
                dtype,
            );
        }
        let profile = await ProfileInfo.findByPk(pid);
        try {
            lat = profile?.latitude ? profile.latitude : lat;
            lng = profile?.longitude ? profile.longitude : lng;
        } catch (e) {
            console.log("In Cart default", e);
            lat = 12.979999;
            lng = 80.126028;
        }
        return await locationQueries(lat, lng).getCartForCustomer(
            cid,
            pid,
            isDelivery,
            dTime,
            dtype,
        );
    },
    async removeAllProductToCart(customerId) {
        return await Cart.destroy({
            where: {
                customerId: customerId,
            },
        });
    },
    async checkShopInCart(customerId, shopId) {
        const check = await Cart.findOne({
            where: { customerId },
        });
        if (check == null) return true;
        let checkShop = await check.getShop({ where: { id: shopId } });
        if (checkShop == null || checkShop.length == 0) return false;
        return true;
    },
    async getCartWithCheckout(cid, pid, lat, lng) {
        const DELIVERYCOST = 4.99;
        const getCartDetails = async (lat, lng) => {
            return await Shop.findAll({
                attributes: [
                    "id",
                    "name",
                    "latitude",
                    "longitude",
                    "openTime",
                    "closeTime",
                    [sequelizeLiteralDistance(lat, lng), "distance"],
                    [sequelizeLiteralTerinary(lat, lng, false), "isAvailable"],
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
                                    attributes: ["id", "name", "image"],
                                },
                                { model: Unit, attributes: [] },
                                { model: Multipler, attributes: [] },
                            ],
                            attributes: [
                                "id",
                                "mrp",
                                // "image",
                                "volume",
                                "stock",
                                [sequelizeLiteralMultipler(), "multiplers"],
                            ],
                        },
                        where: { customerId: cid },
                        required: true,
                    },
                ],
                order: [[sequelize.col("distance"), "ASC"]],
            });
        };
        const updateLatLng = async (lat, lng) => {
            if (pid == null) return [lat, lng];
            const profile = await ProfileInfo.findByPk(pid);

            if (profile != null) {
                lat = profile?.latitude;
                lng = profile?.longitude;
            }
            return [lat, lng];
        };
        [lat, lng] = await updateLatLng(lat, lng);
        const calculation = async (lt, lg) => {
            for (const shop of res) {
                let payment = {
                    subTotal: 0,
                    shippingCost: 0,
                };
                shop.deliveryTime = deliveryCalWithExp(
                    shop.openTime,
                    shop.closeTime,
                    2,
                    lt,
                    lg,
                );
                // for (const val of dtypes) {
                //     shop[val.name] = deliveryCalWithExp(
                //         shop.openTime,
                //         shop.closeTime,
                //         3,
                //         lt,
                //         lg,
                //         val.period,
                //     );
                // }
                shop?.carts?.forEach((cartItem) => {
                    payment.subTotal += cartItem.count * cartItem.price;
                });
                payment.shippingCost = DELIVERYCOST;

                shop.payment = {
                    subTotal: payment.subTotal.toFixed(2),
                    shippingCost: payment.shippingCost.toFixed(2),
                };
            }
        };
        let res = JSON.parse(JSON.stringify(await getCartDetails(lat, lng)));
        await calculation(lat, lng);
        return res;
    },
    async getCartCheckout(cid, pid, dtid) {
        const addOneLogic = (x, y, dtype) => {
            if (dtype.deliveryCharge) return false;
            return (x % 11) + y >= 11;
        };
        const getMemberShip = async () =>
            await Premium.findOne({
                include: {
                    where: { customerId: cid },
                    model: Subscription,
                    required: true,
                },
            });
        const getCartDetails = async (lat, lng) => {
            return await Shop.findAll({
                attributes: [
                    "id",
                    "name",
                    "latitude",
                    "longitude",
                    "openTime",
                    "closeTime",
                    [sequelizeLiteralDistance(lat, lng), "distance"],
                    [sequelizeLiteralTerinary(lat, lng, false), "isAvailable"],
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
                                    attributes: ["id", "name", "image"],
                                },
                                { model: Unit, attributes: [] },
                                { model: Multipler, attributes: [] },
                            ],
                            attributes: [
                                "id",
                                "mrp",
                                // "image",
                                "volume",
                                "stock",
                                [sequelizeLiteralMultipler(), "multiplers"],
                            ],
                        },
                        where: { customerId: cid },
                        required: true,
                    },
                ],
                order: [[sequelize.col("distance"), "ASC"]],
            });
        };
        const updateLatLng = async () => {
            if (pid == null) throw "Delivery address required for checkout";
            const profile = await ProfileInfo.findByPk(pid);

            if (profile != null) {
                return [profile, profile.latitude, profile.longitude];
            }
            throw "Required valid profile id";
        };
        const calculation = async (lat, lng, deliveryWithin, custPeriod) => {
            for (const shop of res) {
                let payment = {
                    subTotal: 0,
                    shippingCost: 0,
                    taxes: 0,
                    extra: 0,
                };
                let params = {
                    to_country: profile.countryCode,
                    to_zip: profile.postalCode,
                    to_state: profile.stateCode,
                    shipping: DELIVERYCOST,
                    line_items: [],
                };
                shop.estimateTime = deliveryCalWithExp(
                    shop.openTime,
                    shop.closeTime,
                    deliveryWithin,
                    lat,
                    lng,
                    custPeriod,
                );

                shop?.carts?.forEach((cartItem) => {
                    let addOne = addOneLogic(
                        parseInt(cartItem.already_order),
                        cartItem.count,
                        membership,
                    );
                    cartItem.freeOne = addOne;
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

                payment.shippingCost = DELIVERYCOST;
                payment.extra = EXTRA;
                overAll.extra += payment.extra;
                overAll.subTotal += payment.subTotal;
                overAll.taxes += payment.taxes;
                overAll.shippingCost += payment.shippingCost;
                shop.payment = {
                    subTotal: payment.subTotal.toFixed(2),
                    shippingCost: payment.shippingCost.toFixed(2),
                    taxes: payment.taxes.toFixed(2),
                };
            }
        };
        const updateCalculation = () => {
            overAll.convenience = CONVENIENCE.toFixed(2).toString();
            overAll.total = (
                overAll.shippingCost +
                overAll.taxes +
                overAll.extra +
                overAll.subTotal +
                (overAll.subTotal != 0 ? CONVENIENCE : 0)
            ).toFixed(2);

            //extra field into deliveryCharge
            overAll.shippingCost += overAll.extra;
            delete overAll.extra;
            // overAll.extra = overAll.extra.toFixed(2);

            overAll.shippingCost = overAll.shippingCost.toFixed(2);
            overAll.taxes = overAll.taxes.toFixed(2);
            overAll.subTotal = overAll.subTotal.toFixed(2);
        };

        const membership = await getMemberShip();
        let userDeliverySelect = await DeliveryType.findByPk(dtid);
        let price = parseFloat(userDeliverySelect.price);
        let standardDetails = await DeliveryType.findOne({
            where: { name: "Standard" },
        });
        const STANDARDCOST = parseFloat(standardDetails.price);
        const DELIVERYCOST = membership?.deliveryCharge ? STANDARDCOST : 0;
        const EXTRA = dtid != 1 ? price - STANDARDCOST : 0;
        const CONVENIENCE = 4.99;
        let overAll = {
            subTotal: 0,
            shippingCost: 0,
            extra: 0,
            taxes: 0,
            convenience: 0,
            total: 0,
        };

        let [profile, lat, lng] = await updateLatLng();
        let res = JSON.parse(JSON.stringify(await getCartDetails(lat, lng)));
        await calculation(
            lat,
            lng,
            membership.deliveryWithin,
            userDeliverySelect.period,
        );
        updateCalculation();
        return {
            details: res,
            overall: overAll,
            membership,
        };
    },
    async checkoutDetailsForMeta(data) {
        const {
            customerId: cid,
            profileId: pid,
            tipForDriver: tfd,
            dtid: extra,
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
                                    attributes: ["id", "name", "image"],
                                },
                            ],
                            attributes: ["id", "mrp", "volume"],
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
        let [res, profile] = await orderCreateQuery(cid, pid);
        [res, total] = await orderCreateCalculation(
            res,
            profile,
            tfd,
            CONVENIENCE,
        );
        return total;
    },
    async removeProductToCartByShop({ shopId, customerId }) {
        return await Cart.destroy({ where: { shopId, customerId } });
    },
};

module.exports = cartQueries;
