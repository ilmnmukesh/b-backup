const {
    Product,
    Category,
    Brand,
    BestDrink,
    Varient,
    Multipler,
    Unit,
    Shop,
    Op,
    sequelize,
    SellerAuth,
    Post,
} = require("../../database");
const {
    //sequelizeWhereDistance,
    sequelizeLiteralDistance,
    sequelizeLiteralTerinary,
    sequelizeLiteralMultiplerProduct,
    // sequelizeLiteralProductOrder,
} = require("../distance");

const ORDERING = "ASC";

const CategoryQueries = {
    createCategory: async (name) => {
        const query = await Category.findAll({
            where: {
                name: name,
            },
        });
        if (query.length == 0) {
            const result = await Category.create({
                name: name,
            });
            return [true, result, {}, "Category created successfully..."];
        }
        return [
            false,
            {},
            { name: "Unique constrain error" },
            "Category Already entered!!",
        ];
    },
    getCategories: async () => {
        let res = await Category.findAll({ raw: true, nest: true });
        return res;
    },
    getCategoriesForFilter: async () => {
        let res = await Category.findAll({
            attributes: ["id", ["id", "value"], ["name", "label"]],
            order: [["name", "ASC"]],
        });
        return res;
    },
};

const BrandQueries = {
    getBrands: async (categoryId = null) => {
        let res = await Brand.findAll({
            include: {
                model: Product,
                where: categoryId ? { categoryId } : {},
                attributes: [],
                required: true,
            },
        });
        return res;
    },
    getBrandsForFilter: async () => {
        let res = await Brand.findAll({
            attributes: ["id", ["id", "value"], ["name", "label"], "logo"],
            order: [["name", "ASC"]],
        });
        return res;
    },
};

const ProductQueries = {
    getBasedOnCategory: async (catId, lat = null, lng = null) => {
        return await Product.findAll({
            where: { categoryId: catId },
            attributes: {
                include: [
                    ...(lat && lng
                        ? [
                              [sequelizeLiteralDistance(lat, lng), "distance"],
                              [sequelizeLiteralTerinary(lat, lng, 0), "status"],
                          ]
                        : []),
                ],
            },
            include: [
                {
                    attributes: [],
                    model: Shop,
                    required: true,
                    include: {
                        model: SellerAuth,
                        required: true,
                        attributes: [],
                    },
                },
                Brand,
            ],
            order: [
                ...(lat && lng ? [[sequelize.col("distance"), ORDERING]] : []),
            ],
        });
    },
    getBasedOnBrand: async (bId, catId = null, lat = null, lng = null) => {
        return await Product.findAll({
            where: {
                [Op.and]: [
                    {
                        brandId: bId,
                    },
                    ...(catId ? [{ categoryId: catId }] : []),
                ],
            },
            attributes: {
                include: [
                    ...(lat && lng
                        ? [
                              [sequelizeLiteralDistance(lat, lng), "distance"],
                              [sequelizeLiteralTerinary(lat, lng, 0), "status"],
                          ]
                        : []),
                ],
            },
            include: [
                {
                    attributes: [],
                    model: Shop,
                    required: true,
                    include: {
                        model: SellerAuth,
                        required: true,
                        attributes: [],
                    },
                },
                Brand,
            ],
            order: [
                ...(lat && lng ? [[sequelize.col("distance"), ORDERING]] : []),
            ],
        });
    },
    getOnBestDrink: async (lat = null, lng = null) => {
        return await BestDrink.findAll({
            attributes: {
                include: [
                    ...(lat && lng
                        ? [
                              [sequelizeLiteralDistance(lat, lng), "distance"],
                              [sequelizeLiteralTerinary(lat, lng, 0), "status"],
                          ]
                        : []),
                ],
            },
            include: [
                {
                    model: Product,
                    include: [{ model: Shop, attributes: [] }],
                },
            ],
            //where: sequelizeWhereDistance(lat, lng),
            order: [
                ...(lat && lng ? [[sequelize.col("distance"), ORDERING]] : []),
            ],
        });
    },
    getProductDetails: async (pId, lat = null, lng = null) => {
        let res = await Product.findByPk(pId, {
            attributes: [
                "id",
                "name",
                "description",
                "image",
                ...(lat && lng
                    ? [
                          [sequelizeLiteralDistance(lat, lng), "distance"],
                          [
                              sequelizeLiteralTerinary(lat, lng, 0),
                              "isAvailable",
                          ],
                      ]
                    : [[sequelize.literal(`(select false)`), "isAvailable"]]),
            ],
            include: [
                Brand,
                {
                    model: Varient,
                    include: [
                        {
                            model: Shop,
                            attributes: [
                                "id",
                                "name",
                                "image",
                                "latitude",
                                "longitude",
                                ...(lat && lng
                                    ? [
                                          [
                                              sequelizeLiteralDistance(
                                                  lat,
                                                  lng,
                                              ),
                                              "distance",
                                          ],
                                          [
                                              sequelizeLiteralTerinary(
                                                  lat,
                                                  lng,
                                                  0,
                                              ),
                                              "isAvailable",
                                          ],
                                      ]
                                    : [
                                          [
                                              sequelize.literal(
                                                  `(select false)`,
                                              ),
                                              "isAvailable",
                                          ],
                                      ]),
                            ],
                        },
                        { model: Unit, attributes: [] },
                        { model: Multipler, attributes: [] },
                    ],
                    attributes: [
                        "id",
                        "mrp",
                        // "image",
                        "volume",
                        "stock",
                        ...(lat && lng
                            ? [[sequelizeLiteralDistance(lat, lng), "distance"]]
                            : []),
                        [sequelizeLiteralMultiplerProduct(), "multiplers"],
                    ],
                },
            ],
            order: [
                [sequelize.col("varients.mrp"), "ASC"],
                // ...(shopId
                //     ? [[sequelizeLiteralProductOrder(shopId)]]
                //     : [[sequelize.col("distance"), ORDERING]]),
                ...(lat && lng ? [[sequelize.col("distance"), ORDERING]] : []),
            ],
        });
        if (res == null) throw "Product not found...";
        return res;
    },
    getShopVarients: async (pid, sid) => {
        return await Post.findAll({
            where: { productId: pid, shopId: sid },
            include: { model: Varient, include: [Unit, Multipler] },
        });
    },
    searchProductName: async (search, lat = null, lng = null) => {
        let res = await Post.findAll({
            attributes: [
                "id",
                "price",
                "varientId",
                ...(lat && lng
                    ? [
                          [sequelizeLiteralDistance(lat, lng), "distance"],
                          [sequelizeLiteralTerinary(lat, lng, 0), "status"],
                      ]
                    : [[sequelize.literal("(select false)"), "status"]]),
            ],
            include: [
                {
                    model: Product,
                    required: true,
                    include: [Brand],
                    attributes: ["id", "name", "image"],
                    where: { name: { [Op.iLike]: `%${search}%` } },
                },
                { model: Varient, attributes: ["id", "mrp", "volume"] },
                {
                    model: Shop,
                    attributes: ["id", "name"],
                    required: true,
                    include: {
                        model: SellerAuth,
                        required: true,
                        attributes: [],
                    },
                },
            ],
            order: [
                ...(lat && lng ? [[sequelize.col("distance"), ORDERING]] : []),
            ],
        });

        var distinct = [];
        let resp = [];
        for (var i = 0; i < res.length; i++)
            if (!distinct.includes(res[i].varientId)) {
                resp.push(res[i]);
                distinct.push(res[i].varientId);
            }
        return resp;
    },
};

module.exports = { CategoryQueries, BrandQueries, ProductQueries };
