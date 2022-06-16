const {
    Product,
    Shop,
    Category,
    Brand,
    Op,
    Varient,
    Post,
    MenuItem,
    Partner,
    MenuType,
    Multipler,
    sequelize,
} = require("../../../database");
const LIMIT = 10;

module.exports = {
    getAllMultiplers: async () => await Multipler.findAll(),
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
                    include: { model: Multipler, attributes: ["id", "value"] },
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
    listKitchenItem: async (q, shopId) => {
        return await MenuItem.findAll({
            where: { name: { [Op.iLike]: `%${q}%` } },
            include: [
                {
                    model: Partner,
                    attributes: ["id"],
                    required: true,
                    where: { shopId },
                },
                MenuType,
            ],
        });
    },
    checkProductName: async (name) => {
        const prod = await Product.findOne({
            where: { name },
        });
        if (prod != null) return true;
        return false;
    },
    addProduct: async (shopId, data) => {
        const {
            name,
            description,
            image,
            mrp,
            shots,
            multiplerId,
            selling_price: price,
            discount,
        } = data;
        const transaction = await sequelize.transaction();
        try {
            const category = await Category.findOne({
                where: { name: { [Op.iLike]: "%partner combo%" } },
            });
            const product = await Product.create(
                {
                    name,
                    image,
                    description,
                    brandId: 1,
                    categoryId: category.id,
                },
                { transaction },
            );
            const varient = await Varient.create(
                {
                    mrp,
                    volume: `${shots} each`,
                    multiplerId,
                    unitId: 1,
                    productId: product.id,
                },
                { transaction },
            );

            await Post.create(
                {
                    price,
                    discount,
                    productId: product.id,
                    varientId: varient.id,
                    shopId,
                },
                { transaction },
            );
            await transaction.commit();
            return true;
        } catch (e) {
            console.log(e);
            await transaction.rollback();
            return false;
        }
    },

    addComboPredefined: async (shopId, vid, kid) => {
        let data = { varient: null, kitchenItem: null };
        if (vid != null) {
            const varient = await Varient.findByPk(vid, {
                include: [
                    { model: Multipler, attributes: ["id", "value"] },
                    { model: Product, include: [Brand, Category] },
                ],
            });
            if (varient != null) {
                data.varient = varient;
            }
        }

        if (kid != null) {
            const item = await MenuItem.findByPk(kid, {
                include: [
                    {
                        model: Partner,
                        attributes: ["id"],
                        required: true,
                        where: { shopId },
                    },
                    MenuType,
                ],
            });
            if (item != null) {
                data.kitchenItem = item;
            }
        }
        return data;
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
            varient.volume = volume + " each";
            varient.multiplerId = parseInt(data.multiplerId);
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
