const { Partner, Category, sequelize } = require("../../database");
const {
    sequelizeLiteralDistance,
    sequelizeLiteralTerinary,
} = require("../../others/distance");

module.exports = {
    getPartners: async (lat = null, lng = null) => {
        if (lat && lng) {
            return await Partner.findAll({
                attributes: {
                    include: [
                        [sequelizeLiteralDistance(lat, lng), "distance"],
                        [sequelizeLiteralTerinary(lat, lng, false), "status"],
                    ],
                },
                // where: sequelizeWhereDistance(lat, lng),
                logging: console.log,
                include: [{ model: Category, attributes: ["id", "name"] }],
                order: [[sequelize.col("distance"), "ASC"]],
            });
        }
        return await Partner.findAll({
            include: [
                {
                    model: Category,
                    attributes: ["id", "name"],
                },
            ],
            logging: console.log,
        });
    },
    getDetails: async (id) => {
        return await Partner.findByPk(id);
    },
};
