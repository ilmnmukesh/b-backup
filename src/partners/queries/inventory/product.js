const {
    Product,
    Category,
    Brand,
    Post,
    Op,
    Varient,
    Unit,
    Multipler,
} = require("../../../database");

const LIMIT = 10;
const ProductQueires = {
    getProduct: async (page, q, cat, brd) => {
        const countquery = await Product.count({
            where: q ? { name: { [Op.iLike]: `%${q}%` } } : {},
            include: [
                {
                    model: Category,
                    required: true,
                    where: cat ? { name: { [Op.iLike]: `%${cat}%` } } : {},
                },
                {
                    model: Brand,
                    required: true,
                    where: brd ? { name: { [Op.iLike]: `%${brd}%` } } : {},
                },
            ],
            distinct: true,
        });
        page = countquery / 10 + 1 < page ? 1 : page;
        let query = {
            count: countquery,
            data: await Product.findAll({
                where: q ? { name: { [Op.iLike]: `%${q}%` } } : {},
                include: [
                    {
                        model: Category,
                        attributes: ["name"],
                        required: true,
                        where: cat ? { name: { [Op.iLike]: `%${cat}%` } } : {},
                    },
                    {
                        model: Brand,
                        attributes: ["name"],
                        required: true,
                        where: brd ? { name: { [Op.iLike]: `%${brd}%` } } : {},
                    },
                ],
                offset: (page - 1) * LIMIT,
                limit: LIMIT,
                subquery: false,
                order: ["id", "name"],
            }),
            category: await Category.findAll({
                order: ["name"],
            }),
            brand: await Brand.findAll({
                order: ["name"],
            }),
            categoryAll: await Category.findAll(),
            brandAll: await Brand.findAll(),
            multiplerAll: await Multipler.findAll({
                attributes: ["id", "value"],
            }),
            unitAll: await Unit.findAll({ attributes: ["id", "value"] }),
        };

        return JSON.parse(JSON.stringify(query));
    },

    viewProduct: async (productId, shopId) => {
        let d = await Product.findByPk(productId, {
            include: [
                {
                    model: Category,
                    attributes: ["name"],
                },
                {
                    model: Brand,
                    attributes: ["name"],
                },
                {
                    model: Varient,
                },
            ],
        });
        d = JSON.parse(JSON.stringify(d));
        for (x of d.varients) {
            x.obj = await Post.findOne({
                where: { productId, varientId: x.id, shopId },
            });
        }
        return d;
    },

    searchProduct: async (q) => {
        return await Product.findAll({
            where: { name: { [Op.iLike]: `%${q}%` } },
            include: [
                {
                    model: Category,
                    attributes: ["name"],
                },
                {
                    model: Brand,
                    attributes: ["name"],
                },
            ],
            order: ["id", "name"],
        });
    },

    listOfVolume: async (productId) => {
        return await Varient.findAll({
            where: { productId },
            include: { model: Multipler, attributes: ["id", "value"] },
        });
    },
};

module.exports = ProductQueires;
