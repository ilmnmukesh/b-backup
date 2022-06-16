const { CartQueries, MemberQueries } = require("../../../others/queries");
const {
    paramsValidation,
    uuidValidator,
} = require("../../../others/validation");

module.exports = {
    addToCart: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["varientId", "customerId", "shopId", "count"],
        });
        uuidValidator(req.body.varientId.toString());
        uuidValidator(req.body.customerId.toString());
        const [check, details] = await CartQueries.addProductToCart(req.body);
        response.success = true;
        response.data = details;
        if (!check) {
            response.description = "Already add to cart";
        } else {
            response.description = "Add to cart successfully";
        }
    },
    removeFromCart: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["varientId", "shopId", "customerId"],
        });
        uuidValidator(req.body.varientId.toString());
        uuidValidator(req.body.customerId.toString());
        const [check, details] = await CartQueries.removeProductToCart(
            req.body,
        );
        response.success = check;
        response.data = details;
        if (!response.success) {
            response.description = "Does not exists in cart";
        } else {
            response.description = "Remove from cart successfully";
        }
    },
    getCart: async (req, response) => {
        const { cid } = req.params;
        const { profileId, lat, lng } = req.query;

        response.approve = false;
        uuidValidator(cid.toString());
        if (profileId) {
            uuidValidator(profileId.toString());
        }
        let dtypes = await MemberQueries.deliveryTypes();
        let [isDelivery, obj] =
            await MemberQueries.findCustomerMembershipCartInfo(cid);
        let [details, payment, approve] = await CartQueries.getCartForCustomer(
            cid,
            profileId,
            lat,
            lng,
            isDelivery,
            obj.deliveryWithin,
            dtypes,
        );
        response.options = {
            ...JSON.parse(JSON.stringify(obj)),
            extra: dtypes,
        };
        response.success = true;
        response.approve = approve;
        response.payment = payment;
        response.data = details;

        if (details.length == 0) {
            response.description = "Cart is Empty";
        } else if (response.payment.taxes == 0) {
            response.description = "Require delivery address to find taxes";
        } else {
            response.description = "Cart fetch successfully";
        }
    },
    removeAllFromCart: async (req, response) => {
        const result = await CartQueries.removeAllProductToCart(
            req.params.customerId,
        );
        response.success = true;
        response.data = result;
    },
    checkShopInCart: async (req, response) => {
        const { cid, sid } = req.query;
        paramsValidation({
            params: ["cid", "sid"],
            body: req.query,
        });
        uuidValidator(cid);
        response.data = {
            existInShop: await CartQueries.checkShopInCart(cid, sid),
        };
        response.success = true;
    },
    getCartWithCheckout: async (req, response) => {
        const { cid } = req.params;
        const { pid, lat, lng } = req.query;
        response.approve = false;
        uuidValidator(cid.toString());
        response.data = await CartQueries.getCartWithCheckout(
            cid,
            pid,
            lat,
            lng,
        );
        response.success = true;
    },
    getCartCheckout: async (req, response) => {
        const { cid } = req.params;
        const { pid, dtid } = req.query;
        uuidValidator(cid.toString());
        response.data = await CartQueries.getCartCheckout(cid, pid, dtid);
        response.success = true;
    },
    removeAllCartBasedOnShop: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["shopId", "customerId"],
        });
        uuidValidator(req.body.customerId.toString());
        const details = await CartQueries.removeProductToCartByShop(req.body);
        response.success = true;
        response.data = details;
    },
};

// const { calculateTaxAmount } = require("../../../others/taxjar");

// const checkoutTax = async (data, info, cnt) => {
//     if (info == "null" || info == null || info.length == 0) {
//         return 0;
//     } else {
//         let params = {
//             to_country: "US",
//             to_zip: 85027,
//             to_state: "AZ",
//             shipping: 5.0 * cnt,
//             line_items: [],
//         };
//         params.to_country = info.countryCode;
//         params.to_state = info.stateCode;
//         params.to_zip = info.postalCode;
//         data.map((f) => {
//             params.line_items.push({
//                 id: f.id,
//                 quantity: f.count,
//                 unit_price: f.price,
//                 product_tax_code: f.product.category.code,
//             });
//         });
//         console.log(params);
//         //return 0.22;
//         return (await calculateTaxAmount(params)).tax.amount_to_collect;
//     }
// };
// const calculateAmount = async (data, info, cnt) => {
//     let details = {
//         subTotal: 0,
//         shippingCost: 5 * cnt,
//         taxes: 0.23,
//         convenience: 4.99,
//         total: 0,
//     };
//     for (let i = 0; i < data.length; i++) {
//         let e = data[i];
//         let res = data[i].varient;
//         details.subTotal += res.sellingPrice * e.count;
//     }
//     details.subTotal = Math.round(details.subTotal * 100) / 100;
//     try {
//         details.taxes = await checkoutTax(data, info, cnt); //Math.round((details.subTotal / 100) * 7.5 * 100) / 100;
//         details.taxes = Math.round(details.taxes * 100) / 100;
//     } catch (e) {
//         details.error = e.message;
//     }
//     details.total =
//         details.subTotal +
//         details.shippingCost +
//         details.taxes +
//         details.convenience;
//     return {
//         subTotal: details.subTotal == 0 ? "0" : details.subTotal.toFixed(2),
//         shippingCost:
//             details.shippingCost == 0 ? "0" : details.shippingCost.toFixed(2),
//         taxes: details.taxes == 0 ? "0" : details.taxes.toFixed(2),
//         convenience:
//             details.convenience == 0 ? "0" : details.convenience.toFixed(2),
//         total: details.total == 0 ? "0" : details.total.toFixed(2),
//         error: details?.error,
//     };
// };
// const addMultiplers = (details) => {
//     let count = 0;
//     let shops = [];
//     details.map((e) => {
//         if (!shops.includes(e.shopId)) {
//             shops.push(e.shopId);
//             count++;
//         }
//         if (e.varient) {
//             try {
//                 e.varient.multiplers =
//                     e.varient.multipler.value + " " + e.varient.unit.value;
//                 delete e.varient.unit;
//                 delete e.varient.multipler;
//             } catch (s) {
//                 e.varient.multiplers = " 1";
//             }
//             e.product = e.varient.product;
//             delete e.varient.product;
//         }
//     });
//     return count;
// };
