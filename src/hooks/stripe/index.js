const express = require("express");
const app = express();
const stripe = require("stripe");
const { OrderQueries, MemberQueries } = require("../../others/queries");
const { OrderDetails } = require("../../dashboard/queries");
const { ENUM_TYPE } = require("../../others/payment");
const {
    OrderQueries: CloudOrderQueries,
    KitchenCartQueires,
    EventQueries,
} = require("../../mobile/cloud/queries");

const SuccessPI = async (paymentIntent, io) => {
    let data = paymentIntent.metadata;
    // const data = {
    //     customerId: "4660a786-ce8d-40e1-b74d-5d2e10f161ec",
    //     referenceId: "pi_3KUFbyK2qNDvRq9K0Mt5gOyk",
    //     profileId: "69dfbe9c-dcef-490a-828a-0a6f202105f7",
    //     tipForDriver: 0.04,
    //     extraId: 2,
    //     paymentFor: ENUM_TYPE.E_COM_ORDER,
    // };
    // const data = {
    //     customerId: "4660a786-ce8d-40e1-b74d-5d2e10f161ec",
    //     amount: paymentIntent.amount / 100,
    //     paymentFor: ENUM_TYPE.SUBCRIPTION,
    // };

    // const data = {
    //     customerId: "4660a786-ce8d-40e1-b74d-5d2e10f161ec",
    //     amount: paymentIntent.amount / 100,
    //     paymentFor: ENUM_TYPE.CLOUD_ORDER,
    //     referenceId: paymentIntent.id,
    // };

    // let data = {
    //     customerId: "4660a786-ce8d-40e1-b74d-5d2e10f161ec",
    //     paymentFor: ENUM_TYPE.KITCHEN_ORDER,
    //     partnerId: 1,
    //     tipForService: 0.1,
    // };

    // let data = {
    //     eventId: 1,
    //     noOfTickets: 10,
    //     registrar: "TestName",
    //     customerId: "4660a786-ce8d-40e1-b74d-5d2e10f161ec",
    //     paymentFor: ENUM_TYPE.EVENT_BOOKING,
    // };

    if (data?.customerId == null) return;

    if (data.paymentFor == ENUM_TYPE.E_COM_ORDER) {
        data = {
            ...paymentIntent.metadata,
            totalAmount: paymentIntent.amount / 100,
            referenceId: paymentIntent.id,
        };

        const res = await OrderQueries.createOrder(data);
        for (const order of res) {
            let data = JSON.parse(JSON.stringify(order));

            io.emit("shopListener_" + order.shopId, {
                fromHook: "welcome!",
                display: true,
                data,
            });
            io.emit("alert_shop_" + order.shopId, {
                fromHook: "Welcome!",
                display: true,
                alert: await OrderDetails.getShopCount(order.shopId),
            });
        }
    } else if (data.paymentFor == ENUM_TYPE.SUBCRIPTION) {
        await MemberQueries.membershipUpdate(
            paymentIntent.id,
            data.customerId,
            data.amount,
        );
    } else if (data.paymentFor == ENUM_TYPE.CLOUD_ORDER) {
        data = {
            ...data,
            amount: paymentIntent.amount / 100,
            referenceId: paymentIntent.id,
        };
        await CloudOrderQueries.createOrder(data);
    } else if (data.paymentFor == ENUM_TYPE.KITCHEN_ORDER) {
        data = {
            ...data,
            amount: paymentIntent.amount / 100,
            txnClientId: paymentIntent.id,
        };
        await KitchenCartQueires.createOrder(data);
    } else if (data.paymentFor == ENUM_TYPE.EVENT_BOOKING) {
        data = {
            ...data,
            amount: paymentIntent.amount / 100,
            txnClientId: paymentIntent.id,
        };
        await EventQueries.createReservation(data);
    }
};

app.post(
    "/",
    express.raw({ type: "application/json" }),
    async (request, response) => {
        const sig = request.headers["stripe-signature"];

        let event;
        // const endpointSecret = "whsec_8OxryISWSHt7lKaodfbD6lXg72xLeqQv";
        // const endpointSecret =
        //     "whsec_483e73849a040fedc478df670ec04746e11747f367c3d88f28d5693de9201a77";
        try {
            event = stripe.webhooks.constructEvent(
                request.body,
                sig,
                process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET,
            );
        } catch (err) {
            console.log(err.toString());
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle the event
        switch (event.type) {
            case "payment_intent.succeeded":
            case "payment_intent.amount_capturable_updated":
                const paymentIntent = event.data.object;
                // const data = paymentIntent.meta;
                const io = request.app.get("socketio");

                await SuccessPI(paymentIntent, io);
                // Then define and call a function to handle the event payment_intent.succeeded
                break;
            // ... handle other event types
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        // Return a 200 response to acknowledge receipt of the event
        response.send();
    },
);

module.exports = app;
