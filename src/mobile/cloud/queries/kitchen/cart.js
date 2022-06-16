const {
    KitchenCart,
    Subscription,
    KitchenWallet,
    CloudWallet,
    MenuItem,
    MenuType,
    Varient,
    Product,
    Transaction,
    KitchenOrder,
    KitchenOrderProduct,
    Partner,
    sequelize,
    Category,
    Post,
    Multipler,
} = require("../../../../database");
const { ENUM_TYPE } = require("../../../../others/payment");
const { calculateTaxAmount } = require("../../../../others/taxjar");

// const sequelize = new (require("sequelize").Sequelize)();
// const M = sequelize.define();

const calculaton = async (customerId, partnerId, ccode, zcode, scode) => {
    let cart = await KitchenCart.findAll({
        where: { customerId },
        include: [
            {
                model: MenuItem,
                where: { partnerId },
                include: { model: MenuType, attributes: ["code"] },
                required: true,
            },
        ],
    });
    let charges = {
        subTotal: 0,
        kitchenTax: 0,
        processingFee: 0,
        total: 0,
    };

    if (cart.length == 0) {
        return {
            cart,
            charges,
        };
    }
    let params = {
        to_country: ccode,
        to_zip: zcode,
        to_state: scode,
        shipping: 0,
        line_items: [],
    };

    for (const obj of cart) {
        charges.subTotal += obj.count * obj.menu_item.price;
        params.line_items.push({
            id: obj.id,
            quantity: obj.count,
            unit_price: obj.menu_item.price,
            product_tax_code: obj.menu_item.menu_type.code,
        });
    }

    charges.kitchenTax = (
        await calculateTaxAmount(params)
    ).tax.amount_to_collect;

    charges.total = charges.subTotal + charges.kitchenTax;
    charges.processingFee = charges.total == 0 ? 0 : 2.99;
    charges.total += charges.processingFee;

    return { cart, charges };
};

const calculateWalletTax = async (
    customerId,
    partnerId,
    ccode,
    zcode,
    scode,
) => {
    const wallets = await KitchenWallet.findAll({
        where: {
            customerId,
            partnerId,
            isChecked: false,
        },
        attributes: ["id", "customerId", "noOfShots", "createdAt"],
        include: {
            model: CloudWallet,
            attributes: ["shotsLeft"],
            include: [
                {
                    model: Varient,
                    include: { model: Multipler, attributes: ["value"] },
                    attributes: ["id"],
                },
                { model: Post, attributes: ["price"] },
                {
                    model: Product,
                    include: { model: Category, attributes: ["code"] },
                },
            ],
        },
    });

    let params = {
        to_country: ccode,
        to_zip: zcode,
        to_state: scode,
        shipping: 0,
        line_items: [],
    };
    for (const wallet of wallets) {
        let t = wallet.cloud_wallet?.varient?.multipler?.value;
        params.line_items.push({
            id: wallet.id,
            quantity: wallet.noOfShots,
            unit_price:
                wallet.cloud_wallet.product_post?.price / (t == null ? 1 : t),
            product_tax_code: wallet.cloud_wallet.product?.category?.code,
        });
    }
    console.log(params);
    if (wallets.length == 0) return 0;
    return {
        wallet: wallets,
        tax: (await calculateTaxAmount(params)).tax.amount_to_collect,
    };
};

module.exports = {
    addToCart: async (customerId, items) => {
        let obj = [];
        for (const item of items) {
            const { itemId: menuItemId, count } = item;
            if (count < 1) {
                obj.push({
                    success: false,
                    description: "count aleast need one",
                    item,
                });
                continue;
            }
            let cart = await KitchenCart.findOne({
                where: {
                    customerId,
                    menuItemId,
                },
            });

            if (cart == null) {
                cart = await KitchenCart.create({
                    menuItemId,
                    customerId,
                    count,
                });
                obj.push({
                    success: true,
                    item: cart,
                    description: "Add to kitchen cart successfully",
                });
            } else {
                cart.count += count;
                await cart.save();
                obj.push({
                    success: true,
                    item: cart,
                    description: "Update to kitchen cart successfully",
                });
            }
        }
        return obj;
    },

    reduceWallet: async (customerId, partnerId, wallets) => {
        let obj = [];
        const membership = await Subscription.findOne({
            where: { customerId },
        });

        for (const wallet of wallets) {
            const { walletId: cloudWalletId, noOfShots } = wallet;
            let success = false;
            if (membership.premiumId == 1 && noOfShots > 1) {
                obj.push({
                    success,
                    wallet,
                    description: "Upgrade to redeem more than one",
                });
                continue;
            }

            let kitchenWallet = await KitchenWallet.findOne({
                where: {
                    customerId,
                    cloudWalletId,
                    partnerId,
                    isChecked: false,
                },
            });
            let cloudWallet = await CloudWallet.findByPk(cloudWalletId);
            if (cloudWallet == null || noOfShots > cloudWallet.shotsLeft) {
                obj.push({
                    success,
                    wallet,
                    description: "No more shots lefts",
                });
                continue;
            }
            if (kitchenWallet == null) {
                kitchenWallet = await KitchenWallet.create({
                    customerId,
                    cloudWalletId,
                    partnerId,
                    createdAt: new Date(),
                    isPremium: membership.premiumId == 1 ? false : true,
                    noOfShots,
                });
                cloudWallet.shotsLeft -= noOfShots;
                await cloudWallet.save();
                obj.push({
                    success: true,
                    kitchenWallet,
                    description: "Wallet count added...",
                });
            } else if (kitchenWallet.isPremium) {
                kitchenWallet.noOfShots += noOfShots;
                await kitchenWallet.save();
                cloudWallet.shotsLeft -= noOfShots;
                await cloudWallet.save();
                obj.push({
                    success: true,
                    kitchenWallet,
                    description: "Wallet count updated...",
                });
            } else {
                obj.push({
                    success,
                    wallet,
                    description: "Redeemation wallet is limited",
                });
            }
        }
        return obj;
    },

    checkout: async (customerId, partnerId) => {
        const {
            countryCode: ccode,
            postalCode: zcode,
            stateCode: scode,
        } = await Partner.findByPk(partnerId);
        const { cart, charges } = await calculaton(
            customerId,
            partnerId,
            ccode,
            zcode,
            scode,
        );

        const { wallet, tax } = await calculateWalletTax(
            customerId,
            partnerId,
            ccode,
            zcode,
            scode,
        );
        charges.walletTax = tax != null ? tax : 0;
        charges.total += charges.walletTax;
        if (
            wallet != null &&
            charges.processingFee == 0 &&
            wallet.length != 0
        ) {
            charges.processingFee = charges.total == 0 ? 0 : 2.99;
            charges.total += charges.processingFee;
        }
        charges.total = charges.total.toFixed(2);
        return {
            items: cart,
            wallet: wallet == null ? [] : wallet,
            payment: charges,
        };
    },
    createOrder: async (data) => {
        const { txnClientId, customerId, partnerId, tipForService, amount } =
            data;
        const {
            countryCode: ccode,
            postalCode: zcode,
            stateCode: scode,
        } = await Partner.findByPk(partnerId);
        const { cart, charges } = await calculaton(
            customerId,
            partnerId,
            ccode,
            zcode,
            scode,
        );

        const { wallet, tax } = await calculateWalletTax(
            customerId,
            partnerId,
            ccode,
            zcode,
            scode,
        );
        charges.walletTax = tax != null ? tax : 0;
        charges.total += charges.walletTax;
        if (
            wallet != null &&
            charges.processingFee == 0 &&
            wallet.length != 0
        ) {
            charges.processingFee = charges.total == 0 ? 0 : 2.99;
            charges.total += charges.processingFee;
        }
        charges.total = charges.total.toFixed(2);

        const txn = await Transaction.create({
            customerId,
            amount,
            txnClientId,
            orderFor: ENUM_TYPE.KITCHEN_ORDER,
        });
        const transaction = await sequelize.transaction();

        try {
            const order = await KitchenOrder.create(
                {
                    subTotal: charges.subTotal,
                    total:
                        parseFloat(charges.total) + parseFloat(tipForService),
                    walletTax: charges.walletTax,
                    kitchenTax: charges.kitchenTax,
                    processingFee: charges.processingFee,
                    tipForService,
                    customerId,
                    partnerId,
                    transactionId: txn.id,
                },
                { transaction },
            );
            for (const obj of cart) {
                await KitchenOrderProduct.create(
                    {
                        unitPrice: obj.menu_item.price,
                        count: obj.count,
                        menuItemId: obj.menuItemId,
                        kitchenOrderId: order.id,
                    },
                    { transaction },
                );
                await obj.destroy({ transaction });
            }

            await KitchenWallet.update(
                { isChecked: true },
                {
                    where: {
                        customerId,
                        partnerId,
                        isChecked: false,
                    },
                },
            );
            await transaction.commit();
        } catch (e) {
            console.log(e);
            await transaction.rollback();
        }
    },
    getOrders: async (customerId) => {
        return await KitchenOrder.findAll({
            where: { customerId },
            include: [{ model: KitchenOrderProduct, include: MenuItem }],
        });
    },
    checkCart: async (customerId) => {
        return await KitchenCart.findAll({
            where: { customerId },
            include: {
                model: MenuItem,
                include: { model: Partner, attributes: ["id", "name"] },
            },
        });
    },
};
