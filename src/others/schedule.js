const { scheduleJob } = require("node-schedule");
const {
    Scheduler,
    Shop,
    Order,
    OrderCancel,
    SellerAuth,
} = require("../database");
const { acceptCapture, cancelCapture, transferAmount } = require("./payment");

const createCaptureProcess = async (paymentId) => {
    const acceptCount = await Order.count({
        where: { referenceId: paymentId, orderAccepted: true },
    });
    const orders = await Order.findAll({
        where: { referenceId: paymentId },
        include: {
            model: Shop,
            attributes: ["id"],
            required: true,
            include: {
                model: SellerAuth,
                required: true,
                attributes: ["accountId", "isVerified"],
            },
        },
    });
    let capture = 0;
    let transfer = [];
    for (const order of orders) {
        if (order.orderAccepted && order.shop.seller_auth.isVerified) {
            capture += parseFloat(order.totalAmount);
            transfer.push({
                id: order.id,
                amount: (
                    parseFloat(
                        order.totalAmount - order.txnFee - order.convenienceFee,
                    ) * 100
                ).toFixed(),
                stripeAccount: order.shop.seller_auth.accountId,
            });
        } else {
            let cancelAmt = order.totalAmount;
            if (acceptCount != 0) {
                capture += parseFloat(order.convenienceFee);
                cancelAmt = (order.totalAmount - order.convenienceFee).toFixed(
                    2,
                );
            }
            await Order.update(
                { status: "cancelled" },
                { where: { id: order.id } },
            );

            await OrderCancel.create({
                reason: "Seller does not take this order",
                amount: cancelAmt,
                orderId: order.id,
            });
        }
    }
    console.log("SHOP:", capture, transfer);
    if (capture == 0) await cancelCapture(paymentId);
    else await acceptCapture(parseInt(capture * 100), paymentId);

    return transfer;
};

const createTransferProcess = async (paymentId, transfer) => {
    for (const trans of transfer) {
        try {
            await transferAmount(trans.amount, trans.stripeAccount, paymentId);
            await Order.update(
                { amountTransferred: true },
                { where: { id: trans.id } },
            );
        } catch (e) {
            console.log(e);
        }
    }
};

const captureAmount = async (paymentId) => {
    console.log("Amount has been capturing");

    //calling payment capture and transfer to corresponding stripe account
    const transfer = await createCaptureProcess(paymentId);
    if (transfer.length != 0) await createTransferProcess(paymentId, transfer);
    // update orders and scheduler

    await Scheduler.update({ executed: true }, { where: { paymentId } });

    console.log("Amount has been captured");
};

const scheduleStartup = async () => {
    try {
        const waiting = await Scheduler.findAll({
            where: { executed: false },
        });
        for (const wait of waiting) {
            const waitTime = new Date(wait.time);
            if (waitTime < new Date()) {
                // calling method capturing amount
                await captureAmount(wait.paymentId);
            } else {
                scheduleJob(waitTime, () => {
                    captureAmount(wait.paymentId);
                }); //calling method capturing amount
            }
        }
    } catch (e) {
        console.log(e.message);
    }
};

const scheduleCaptureAmount = async (paymentId, time) => {
    await Scheduler.create({
        time,
        paymentId,
    });

    scheduleJob(time, () => {
        captureAmount(paymentId);
    }); //calling method capturing amount
};

module.exports = { scheduleStartup, scheduleCaptureAmount };
