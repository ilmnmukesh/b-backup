const {
    Transaction,
    EventReservation,
    sequelize,
    Event,
    EventImage,
} = require("../../../database");
const { ENUM_TYPE } = require("../../../others/payment");
const { createQRWithCenterLogo } = require("../qr");

module.exports = {
    createReservation: async (data) => {
        const { customerId, eventId, amount, txnClientId } = data;
        const { noOfTickets, registrar } = data;

        const txn = await Transaction.create({
            customerId,
            amount,
            txnClientId,
            orderFor: ENUM_TYPE.EVENT_BOOKING,
        });
        const transaction = await sequelize.transaction();

        try {
            await EventReservation.create(
                {
                    customerId,
                    eventId,
                    amount,
                    noOfTickets,
                    registrar,
                    status: "reserved",
                    transactionId: txn.id,
                },
                { transaction },
            );

            await Event.increment(
                { ticketLeft: -noOfTickets },
                { where: { id: eventId }, transaction },
            );
            await transaction.commit();
        } catch (e) {
            console.log(e);
            await transaction.rollback();
        }
    },

    getEventReservation: async (customerId) => {
        return await EventReservation.findAll({
            where: { customerId },
            include: {
                model: Event,
                include: [EventImage],
                attributes: { exclude: ["noOftickets", "ticketLeft"] },
            },
        });
    },

    generateQR: async (id, customerId) => {
        const event_reserved = await EventReservation.findByPk(id, {
            where: { customerId },
        });
        if (event_reserved == null) {
            throw "Not valid reservation";
        }
        if (event_reserved.status == "redeemed") {
            throw "Already redeemed this ticket!";
        }
        let url = `${process.env.HOST}/admin/event/validate?id=${id}&c=${customerId}`;
        const resp = await createQRWithCenterLogo(
            url,
            `${process.env.HOST}/images/brand.jpg`,
            210,
            40,
        );
        return resp;
    },
};
