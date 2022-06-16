const {
    Category,
    Brand,
    Partner,
    sequelize,
    Amenitites,
    Product,
    CloudWallet,
} = require("../../../database");
const { sequelizeLiteralDistance } = require("../../../others/distance");
const { ProductQueries } = require("../../../others/queries");

module.exports = {
    userDashboardWallet: async (customerId) => {
        return await CloudWallet.findAll({
            where: { customerId },
            include: [{ model: Product, attributes: ["name", "image"] }],
            limit: 5,
        });
    },
    partnerDashboard: async (lat, lng) => {
        return await Partner.findAll({
            attributes: {
                include: [
                    ...(lat && lng
                        ? [[sequelizeLiteralDistance(lat, lng), "distance"]]
                        : []),
                ],
                exclude: ["about", "createdAt", "updatedAt"],
            },
            include: [{ model: Amenitites, attributes: ["id", "name"] }],
            order: [...(lat && lng ? [sequelize.col("distance")] : [])],
        });
    },
    categoryDashboard: async () => {
        return await Category.findAll();
    },
    brandDashboard: async (categoryId = null) => {
        return await Brand.findAll({
            include: {
                model: Product,
                where: categoryId ? { categoryId } : {},
                attributes: [],
                required: true,
            },
        });
    },
    getBasedOnCategory: ProductQueries.getBasedOnCategory,
    getBasedOnBrand: ProductQueries.getBasedOnBrand,
};
