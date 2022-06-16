const {
    Product,
    Shop,
    Category,
    Brand,
    Post,
    sequelize,
    Op,
    Varient,
    Unit,
    Multipler,
} = require("../../../database");
const { paramsValidationSingleLine } = require("../../../others/validation");
const { s3 } = require("../../s3");

const paramsTypecheck = ({ body, params }) => {
    const typeCheck = (z) => {
        if (typeof z == "string" || typeof z == "object") {
            return true;
        }
        return false;
    };
    let err = "";
    params.forEach((e) => {
        if (!typeCheck(body[e])) {
            err += ", " + e;
        } else if (typeof body[e] == "string") {
            body[e] = [body[e]];
        }
    });
    if (err != "") throw "(" + err.slice(2) + ") fields are not valid";
};

const LIMIT = 10;
const ProductQueires = {
    getProduct: async (shopId, page, q, cat, brd) => {
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
        page = countquery / 10 < page ? 1 : page;
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
                    ],
                },
                order: ["name"],
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
                    ],
                },
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
    getUnits: async () => {
        return await Unit.findAll();
    },
    getMultiplers: async () => {
        return await Multipler.findAll();
    },
    addProduct: async (shopId, data) => {
        const {
            name,
            image,
            description,
            category: categoryId,
            brand: brandId,
            mrp,
            volume,
            units,
            multiplers,
            price,
            discount,
        } = data;
        const stock = 1;
        const isUnique = await Product.count({ where: { name } });

        if (isUnique != 0) {
            return {
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
                for (let i = 0; i < mrp.length; i++) {
                    const varient = await Varient.create(
                        {
                            mrp: mrp[i],
                            volume: volume[i],
                            stock,
                            unitId: units[i],
                            multiplerId: multiplers[i],
                            productId: prod.id,
                        },
                        { transaction },
                    );

                    await Post.create(
                        {
                            price: price[i],
                            discount: discount[i],
                            productId: prod.id,
                            varientId: varient.id,
                            shopId,
                        },
                        { transaction },
                    );
                }
                await transaction.commit();
                return {
                    msg: `${name} is created successfully`,
                };
            } catch (e) {
                console.log(e);
                await transaction.rollback();
                throw e;
            }
        }
    },
    bulkInsertProduct: async (shopId, data) => {
        let err_data = [];
        for (let i = 0; i < data.length; i++) {
            let curr = data[i];
            try {
                paramsValidationSingleLine({
                    body: curr,
                    params: [
                        "name",
                        "description",
                        "image",
                        "categoryId",
                        "brandId",
                        "mrp",
                        "volume",
                        "discount",
                        "unitId",
                        "multiplerId",
                        "price",
                    ],
                });
                paramsTypecheck({
                    body: curr,
                    params: [
                        "mrp",
                        "discount",
                        "unitId",
                        "volume",
                        "multiplerId",
                        "price",
                    ],
                });

                const {
                    name,
                    image,
                    description,
                    categoryId,
                    brandId,
                    mrp,
                    volume,
                    unitId,
                    multiplerId,
                    price,
                    discount,
                } = curr;
                const stock = 1;
                let new_image = image;
                if (!image.includes(".amazonaws.com")) {
                    try {
                        let r_img = name
                            .toLowerCase()
                            .replace(/ /g, "_")
                            .replace(/[^\w-]+/g, "");
                        const data = await s3
                            .getObject({
                                Bucket: process.env.AWS_BUCKET_NAME,
                                Key: `product/${r_img}.png`,
                            })
                            .promise();
                        console.log(data);
                        new_image = `https://s3.amazonaws.com/${process.env.AWS_BUCKET_NAME}/product/${r_img}.png`;
                    } catch (err) {
                        new_image = `${process.env.HOST}/images/loading.png`;
                    }
                }

                const isUnique = await Product.findOne({ where: { name } });

                if (isUnique != null) {
                    const transaction = await sequelize.transaction();
                    try {
                        for (let j = 0; j < mrp.length; j++) {
                            const varient = await isUnique.getVarients({
                                where: {
                                    volume: { [Op.iLike]: `%${volume[j]}%` },
                                },
                            });

                            if (varient.length != 0) {
                                const varientId = varient[0].id;
                                let check = await Post.findOne({
                                    where: {
                                        productId: isUnique.id,
                                        varientId,
                                        shopId,
                                    },
                                });
                                if (check == null) {
                                    await Post.create(
                                        {
                                            price: price[j],
                                            discount: discount[j],
                                            productId: isUnique.id,
                                            varientId,
                                            shopId,
                                        },
                                        { transaction },
                                    );
                                    console.log("create post");
                                } else {
                                    check.price = price[j];
                                    check.discount = discount[j];
                                    await check.save({ transaction });
                                    console.log("update post");
                                }
                            } else {
                                const varient = await Varient.create(
                                    {
                                        mrp: mrp[j],
                                        volume: volume[j],
                                        stock,
                                        unitId: unitId[j],
                                        multiplerId: multiplerId[j],
                                        productId: isUnique.id,
                                    },
                                    { transaction },
                                );

                                await Post.create(
                                    {
                                        price: price[j],
                                        discount: discount[j],
                                        productId: isUnique.id,
                                        varientId: varient.id,
                                        shopId,
                                    },
                                    { transaction },
                                );
                                console.log("create varient and post");
                            }
                        }
                        await transaction.commit();
                        continue;
                    } catch (e) {
                        console.log(e);
                        await transaction.rollback();
                        throw e;
                    }
                }
                let prod;
                const transaction = await sequelize.transaction();
                try {
                    prod = await Product.create(
                        {
                            name,
                            description,
                            image: new_image,
                            categoryId,
                            brandId,
                        },
                        { transaction },
                    );
                    for (let i = 0; i < mrp.length; i++) {
                        const varient = await Varient.create(
                            {
                                mrp: mrp[i],
                                volume: volume[i],
                                stock,
                                unitId: unitId[i],
                                multiplerId: multiplerId[i],
                                productId: prod.id,
                            },
                            { transaction },
                        );

                        await Post.create(
                            {
                                price: price[i],
                                discount: discount[i],
                                productId: prod.id,
                                varientId: varient.id,
                                shopId,
                            },
                            { transaction },
                        );
                    }
                    await transaction.commit();
                } catch (e) {
                    console.log(e);
                    await transaction.rollback();
                    throw e;
                }
            } catch (e) {
                curr.error = e.toString();
                curr.index = i + 1;
                err_data.push(curr);
            }
        }
        return err_data;
    },
    updateProduct: async (shopId, productId, data) => {
        let check = await Post.findOne({ where: { shopId, productId } });
        let l = [];
        for (let x of data.status) {
            l = l.concat(x.split(":"));
        }
        if (
            check == null &&
            !(l.includes("addVarient") || l.includes("addPost"))
        )
            throw "This product not belong to your's, so unable to edit this";
        else {
            const {
                name,
                image,
                description,
                category: categoryId,
                brand: brandId,
                status,
                mrp,
                volume,
                units,
                multiplers,
                price,
                discount,
            } = data;
            const stock = 1;

            const transaction = await sequelize.transaction();
            try {
                await Product.update(
                    { name, description, image, categoryId, brandId },
                    { transaction, where: { id: productId } },
                );
                // add varient - create new varient and add into post
                // edit - edit already existing details
                // add post - create a new post using varientid

                let i = 0;
                for (let x of status) {
                    let obj = x.split(":");
                    if (obj.length > 0 && obj[0] == "addVarient") {
                        const varient = await Varient.create(
                            {
                                mrp: mrp[i],
                                volume: volume[i],
                                stock,
                                unitId: units[i],
                                multiplerId: multiplers[i],
                                productId: productId,
                            },
                            { transaction },
                        );
                        await Post.create(
                            {
                                price: price[i],
                                discount: discount[i],
                                productId: productId,
                                varientId: varient.id,
                                shopId,
                            },
                            { transaction },
                        );
                    } else if (obj.length > 1 && obj[0] == "edit") {
                        let id = obj[1];
                        let post = await Post.findByPk(id);
                        let varient = await post.getVarient();

                        post.discount = discount[i];
                        post.price = price[i];
                        varient.volume = volume[i];
                        varient.unitId = units[i];
                        varient.multiplerId = multiplers[i];
                        varient.stock = stock;
                        varient.mrp = mrp[i];
                        await post.save({ transaction });
                        await varient.save({ transaction });
                    } else if (obj.length > 1 && obj[0] == "addPost") {
                        let post = await Post.create(
                            {
                                price: price[i],
                                discount: discount[i],
                                productId: productId,
                                varientId: obj[1],
                                shopId,
                            },
                            { transaction },
                        );
                        const varient = await post.getVarient();

                        varient.volume = volume[i];
                        varient.unitId = units[i];
                        varient.multiplerId = multiplers[i];
                        varient.stock = stock;
                        varient.mrp = mrp[i];
                        await varient.save({ transaction });
                    } else {
                        throw "Status unreadable " + obj;
                    }
                    i++;
                }
                if (data?.removeId != null) {
                    if (typeof data.removeId == "string") {
                        await Post.destroy(
                            { where: { id: data.removeId } },
                            { transaction },
                        );
                    } else if (typeof data.removeId == "object") {
                        for (let e = 0; e < data.removeId.length; e++) {
                            await Post.destroy(
                                { where: { id: data.removeId[e] } },
                                {
                                    transaction,
                                },
                            );
                        }
                    }
                }
                transaction.commit();
            } catch (e) {
                console.log(e);
                transaction.rollback();
                throw e.toString();
            }
            return { err: "updated successfully" };
        }
    },
    removeProduct: async (shopId, productId) => {
        const transaction = await sequelize.transaction();
        try {
            await Post.destroy(
                {
                    where: {
                        shopId,
                        productId,
                    },
                },
                { transaction },
            );

            const cnt = await Post.count(
                {
                    where: {
                        productId,
                    },
                },
                { transaction },
            );
            if (cnt == 0) {
                await Product.destroy(
                    {
                        where: { id: productId },
                    },
                    { transaction },
                );
            }
            await transaction.commit();
            return "Successfully deleted";
        } catch {
            await transaction.rollback();
            return "Error while deleting";
        }
    },
    updateImgUrlProduct: async (id, url) => {
        return await Product.update({ image: url }, { where: { id } });
    },
};

module.exports = ProductQueires;
