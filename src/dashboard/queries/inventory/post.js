const {
    Category,
    Product,
    Op,
    Brand,
    Varient,
    Post,
} = require("../../../database");

const Queries = {
    getSearchProduct: async (q) => {
        return await Product.findAll({
            where: { name: { [Op.iLike]: `%${q}%` } },
            include: [
                { model: Category, attributes: ["name"] },
                { model: Brand, attributes: ["name"] },
                { model: Varient, attributes: ["id"] },
            ],
        });
    },
    getProductVarientData: async (varientId) => {
        return await Varient.findByPk(varientId, {
            include: [{ model: Product, include: [Brand, Category] }],
        });
    },
    getProductVarient: async (productId, shopId) => {
        let d = await Product.findByPk(productId, {
            include: [Varient],
        });

        d = JSON.parse(JSON.stringify(d));
        for (x of d.varients) {
            x.obj = await Post.findOne({
                where: { productId, varientId: x.id, shopId },
            });
        }
        return d;
    },
    createPost: async ({
        shopId,
        selling_price: price,
        discount,
        productId,
        varientId,
    }) => {
        if (
            shopId != null &&
            price != null &&
            discount != null &&
            productId != null &&
            varientId != null
        ) {
            try {
                return {
                    msg: "Successfully Created",
                    data: await Post.create({
                        shopId,
                        price,
                        discount,
                        productId,
                        varientId,
                    }),
                };
            } catch (e) {
                return {
                    msg: "something went wrong...",
                    error: e.toString(),
                };
            }
        } else {
            return {
                error: "All fields are required. Please Try again",
            };
        }
    },
    getPost: async (id, shopId) => {
        if (id == null) return null;
        return await Post.findOne({
            include: [Varient, Product],
            where: { id, shopId },
        });
    },
    updatePost: async ({
        shopId,
        selling_price: price,
        discount,
        productId,
        varientId,
    }) => {
        if (
            shopId != null &&
            price != null &&
            discount != null &&
            productId != null &&
            varientId != null
        ) {
            try {
                return {
                    msg: "Successfully updated",
                    data: await Post.update(
                        {
                            price,
                            discount,
                        },
                        {
                            where: {
                                shopId,
                                productId,
                                varientId,
                            },
                        },
                    ),
                };
            } catch (e) {
                return {
                    msg: "something went wrong...",
                    error: e.toString(),
                };
            }
        } else {
            return {
                error: "All fields are required. Please Try again",
            };
        }
    },
};

module.exports = Queries;
