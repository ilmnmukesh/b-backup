const { Category } = require("../../../database");

const CategoryQueries = {
    getCategory: async () => {
        return JSON.parse(JSON.stringify(await Category.findAll()));
    },
    createCategory: async (name, code) => {
        let check = await Category.findOne({ where: { name } });
        if (check != null) {
            return false;
        }
        await Category.create({
            name,
            code,
        });
        return true;
    },
};

module.exports = CategoryQueries;
