const {
    Product,
    Shop,
    Category,
    Brand,
    Op,
    Varient,
    Post,
    sequelize,
} = require("../../../database");
const LIMIT = 10;

const Queries = {
    getProduct: async (shopId, page, q, brd) => {
        const countquery = await Product.count({
            where: q ? { name: { [Op.iLike]: `%${q}%` } } : {},
            include: [
                {
                    model: Shop,
                    where: { id: shopId },
                },
                {
                    model: Category,
                    required: true,
                    where: { name: { [Op.iLike]: `%combo%` } },
                },
                {
                    model: Brand,
                    required: true,
                    where: brd ? { name: { [Op.iLike]: `%${brd}%` } } : {},
                },
            ],
            distinct: true,
        });
        page = countquery / LIMIT < page ? 1 : page;
        let query = {
            count: countquery,
            data: await Product.findAll({
                where: q ? { name: { [Op.iLike]: `%${q}%` } } : {},
                include: [
                    {
                        model: Shop,
                        attributes: [],
                        required: true,
                        where: { id: shopId },
                    },
                    {
                        model: Category,
                        attributes: [],
                        required: true,
                        where: { name: { [Op.iLike]: `%combo%` } },
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
            brand: await Brand.findAll({
                include: {
                    model: Product,
                    required: true,
                    include: [
                        {
                            model: Shop,
                            attributes: [],
                            required: true,
                            where: { id: shopId },
                        },
                        {
                            model: Category,
                            where: { name: { [Op.iLike]: `%combo%` } },
                        },
                    ],
                },
                order: ["name"],
            }),
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
    insertBulkProduct: async (shopId, data) => {
        const stock = 1;
        const categoryId = (
            await Category.findOne({ where: { name: { [Op.iLike]: "combo" } } })
        ).id;
        const brandId = (
            await Category.findOne({ where: { name: { [Op.iLike]: "combo" } } })
        ).id;
        let err_data = [];
        let cnt = 1;
        for (const e of data) {
            e.index = cnt;
            const {
                name,
                description,
                image,
                mrp,
                volume,
                discount,
                "selling price": price,
            } = e;
            const isUnique = await Product.count({ where: { name } });

            if (isUnique != 0) {
                e.error = `${name} is already exists`;
                err_data.push(e);
            } else {
                let prod;
                const transaction = await sequelize.transaction();
                try {
                    prod = await Product.create(
                        {
                            name,
                            description,
                            image,
                            categoryId,
                            brandId,
                        },
                        { transaction },
                    );
                    const varient = await Varient.create(
                        {
                            mrp,
                            volume,
                            stock,
                            unitId: 1,
                            multiplerId: 1,
                            productId: prod.id,
                        },
                        { transaction },
                    );

                    await Post.create(
                        {
                            price,
                            discount,
                            productId: prod.id,
                            varientId: varient.id,
                            shopId,
                        },
                        { transaction },
                    );

                    transaction.commit();
                } catch (f) {
                    transaction.rollback();
                    e.error = f.toString();
                    err_data.push(e);
                }
            }
            cnt += 1;
        }
        return err_data;
    },
    addProduct: async (shopId, data) => {
        const stock = 1;
        const {
            name,
            description,
            image,
            mrp,
            volume,
            discount,
            selling_price: price,
        } = data;
        const categoryId = (
            await Category.findOne({ where: { name: { [Op.iLike]: "combo" } } })
        ).id;
        const brandId = (
            await Category.findOne({ where: { name: { [Op.iLike]: "combo" } } })
        ).id;
        const isUnique = await Product.count({ where: { name } });

        if (isUnique != 0) {
            return {
                details: data,
                err: `${name} is already exists`,
            };
        } else {
            let prod;
            const transaction = await sequelize.transaction();
            try {
                prod = await Product.create(
                    {
                        name,
                        description,
                        image,
                        categoryId,
                        brandId,
                    },
                    { transaction },
                );
                const varient = await Varient.create(
                    {
                        mrp,
                        volume,
                        stock,
                        unitId: 1,
                        multiplerId: 1,
                        productId: prod.id,
                    },
                    { transaction },
                );

                await Post.create(
                    {
                        price,
                        discount,
                        productId: prod.id,
                        varientId: varient.id,
                        shopId,
                    },
                    { transaction },
                );

                transaction.commit();

                return {
                    err: "created successfully",
                    details: data,
                };
            } catch (e) {
                transaction.rollback();
                console.log(e);
            }

            return { prod };
        }
    },
    updateProduct: async (shopId, productId, data) => {
        let check = await Post.findOne({ where: { shopId, productId } });
        if (check == null)
            throw "This product not belong to your's, so unable to edit this";
        else {
            const { name, description, image, mrp, volume, discount, price } =
                data;
            check.discount = discount;
            check.price = price;

            const product = await check.getProduct();
            const varient = await check.getVarient();

            product.name = name;
            product.description = description;
            product.image = image;
            varient.mrp = mrp;
            varient.volume = volume;
            const transaction = await sequelize.transaction();
            try {
                await product.save({ transaction });
                await varient.save({ transaction });
                await check.save({ transaction });
                transaction.commit();
            } catch (e) {
                console.log(e);
                transaction.rollback();
                throw e.toString();
            }
            return { err: "updated successfully" };
        }
    },
    deleteProduct: async (shopId, productId) => {
        /*
            combo alaways has one varient.
            so use productId to find other shop has this product are not

            suppose if they entered wrong details so they want delete means use this functionality
        */
        let check = await Post.count({ where: { productId } });
        if (check > 1) {
            throw "Other shops has this product so we cann't delete this...";
        } else if (check == 1) {
            check = await Post.count({ where: { productId, shopId } });
            if (check == 1) {
                await Product.destroy({
                    where: { id: productId },
                });
                return "Successfully deleted";
            } else {
                throw "This product does not belongs to your shop";
            }
        } else {
            throw "Product not found, might be wrong urls";
        }
    },
};
module.exports = Queries;
