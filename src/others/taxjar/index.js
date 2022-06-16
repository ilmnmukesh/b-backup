const Taxjar = require("taxjar");
require("dotenv").config();

const client = new Taxjar({
    apiKey: process.env.TAXJAR_API_KEY || "ccd6d836c102df66c44723207fdc8020",
});

client.setApiConfig("headers", {
    "x-api-version": "2020-08-07",
});
const calculateTaxAmount = async (data) => {
    try {
        data.nexus_addresses = [
            {
                country: data.to_country,
                state: data.to_state,
            },
        ];
        return await client.taxForOrder(data);
    } catch (e) {
        console.log("Taxjar ", e.message);
        return {
            tax: { amount_to_collect: 0 },
        };
    }
};

const createTransactionOrder = async (data) => {
    return await client.createOrder(data);
};

// client
//     .taxForOrder({
//         to_country: "US",
//         to_zip: 85027,
//         to_state: "AZ",
//         amount: 44.98,
//         shipping: 3,
//         // line_items: [
//         //     {
//         //         id: "1",
//         //         quantity: 1,
//         //         product_tax_code: "50202201A0000",
//         //         unit_price: 15,
//         //     },
//         //     {
//         //         id: "2",
//         //         quantity: 2,
//         //         product_tax_code: "50202203A0000",
//         //         unit_price: 14.99,
//         //     },
//         // ],
//     })
//     .then(console.log);

module.exports = { calculateTaxAmount, createTransactionOrder };
