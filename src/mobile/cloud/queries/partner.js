const {
    Event,
    Amenitites,
    Review,
    Reservation,
    Partner,
    EventImage,
    Shop,
    Product,
} = require("../../../database");
const {
    sequelizeLiteralDistanceForPartner,
} = require("../../../others/distance");

module.exports = {
    partnerDetails: async (sid, lat = null, lng = null) => {
        return await Partner.findByPk(sid, {
            attributes: {
                include: [
                    [sequelizeLiteralDistanceForPartner(lat, lng), "distance"],
                ],
            },
            include: [
                { model: Event, include: [EventImage] },
                Amenitites,
                Review,
                {
                    model: Shop,
                    attributes: ["id"],
                    include: [{ model: Product }],
                },
            ],
        });
    },
    reservation: async (data) => {
        return await Reservation.create(data);
    },
    customerReservation: async (cid) => {
        return await Reservation.findAll({
            where: {
                customerId: cid,
            },
            include: {
                model: Partner,
                attributes: ["id", "name", "image", "location", "sellerName"],
            },
        });
    },
    createReview: async (data) => {
        let partner = await Partner.findByPk(data?.partnerId);
        if (partner == null) return [false, {}];
        partner.rating = (partner.rating + data.rating) / 2;
        partner.save();
        return [true, await Review.create(data)];
    },
};
