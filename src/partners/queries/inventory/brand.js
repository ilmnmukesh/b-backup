const { Brand } = require("../../../database");

const BrandQueries = {
    getBrand: async () => {
        return JSON.parse(JSON.stringify(await Brand.findAll()));
    },
    createBrand: async (name, logo) => {
        let check = await Brand.findOne({ where: { name } });
        if (check != null) {
            return false;
        }
        await Brand.create({
            name,
            logo,
        });
        return true;
    },
};

module.exports = BrandQueries;
