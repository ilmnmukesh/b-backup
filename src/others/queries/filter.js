const {
    Product,
    Op,
    sequelize,
    Varient,
    Shop,
    Post,
    SellerAuth,
    Brand,
    Category,
} = require("../../database");
const {
    sequelizeLiteralDistance,
    sequelizeLiteralTerinary,
} = require("../distance");

const ORDERING = "ASC";

const FilterQueries = {
    range: async (start, end, lat = null, lng = null) => {
        return await Product.findAll({
            attributes: {
                include: [
                    ...(lat && lng
                        ? [
                              [sequelizeLiteralDistance(lat, lng), "distance"],
                              [sequelizeLiteralTerinary(lat, lng), "status"],
                          ]
                        : []),
                ],
            },
            include: [
                {
                    model: Varient,
                    where: {
                        [Op.and]: [
                            { sellingPrice: { [Op.gte]: start } },
                            { sellingPrice: { [Op.lte]: end } },
                        ],
                    },
                },
                {
                    model: Shop,
                    attributes: [],
                    required: true,
                    include: {
                        model: SellerAuth,
                        required: true,
                        attributes: [],
                    },
                },
            ],
            order: [
                ...(lat && lng
                    ? [[sequelize.col("distance"), ORDERING], "id"]
                    : ["id"]),
            ],
        });
    },
    combineOld: async (props) => {
        let att_include = [];
        let where = [];
        let include = [];
        let varient_where = [];
        let shop_req = false;
        let shop_where = [];
        if (props?.category) {
            where.push({ categoryId: props.category });
        }
        if (props?.brand) {
            where.push({ brandId: props.brand });
        }
        if (props?.discount_start) {
            let seq = sequelize.literal(
                `floor(100-"varients"."sellingPrice"/varients.mrp *100)::integer`,
            );
            include.push([seq, "discount"]);
            varient_where.push(
                sequelize.where(seq, {
                    [Op.gte]: parseInt(props.discount_start),
                }),
            );
        }
        if (props?.discount_end) {
            let seq = sequelize.literal(
                `floor(100-"varients"."sellingPrice"/varients.mrp *100)::integer`,
            );
            include.push([seq, "discount"]);
            varient_where.push(
                sequelize.where(seq, {
                    [Op.lte]: parseInt(props.discount_end),
                }),
            );
        }
        if (props?.rating_start) {
            shop_where.push({
                rating: {
                    [Op.gte]: parseFloat(props.rating_start),
                },
            });
        }
        if (props?.rating_start) {
            shop_where.push({
                rating: {
                    [Op.lte]: parseFloat(props.rating_start),
                },
            });
        }
        if (props?.lat && props?.lng) {
            att_include.push([
                sequelizeLiteralDistance(props.lat, props.lng),
                "distance",
            ]);
            att_include.push([
                sequelizeLiteralTerinary(props.lat, props.lng),
                "status",
            ]);
            //where.push(sequelizeWhereDistance(props.lat, props.lng));
        } else if (props?.state) {
            shop_where.push({ shopStateId: { [Op.eq]: props?.state } });
            shop_req = true;
        }
        return await Product.findAll({
            where: {
                [Op.and]: where,
            },
            attributes: {
                include: att_include,
            },
            include: [
                {
                    model: Varient,
                    attributes: {
                        include: include,
                    },
                    where: {
                        [Op.and]: varient_where,
                    },
                },
                {
                    model: Shop,
                    attributes: ["name", "rating", "shopStateId"],
                    where: {
                        [Op.and]: shop_where,
                    },
                    include: {
                        model: SellerAuth,
                        required: true,
                        attributes: [],
                    },
                    required: shop_req,
                },
            ],
        });
    },
    combine: async (props) => {
        const { lat, lng } = props;
        const {
            category: categoryId,
            brand: brandId,
            discount_start: ds,
            discount_end: de,
            rating_start: rs,
            rating_end: re,
        } = props;
        let search = props?.search ? props.search : "";
        let catArray = [];
        if (categoryId == null && search.length >= 3) {
            let cat = await Category.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${search}%`,
                    },
                },
                attributes: ["id"],
            });
            catArray = await cat.map((e) => e.id);
            if (catArray.length != 0) search = "";
        }
        let res = await Post.findAll({
            attributes: [
                "id",
                "price",
                "discount",
                "varientId",
                [
                    sequelize.literal(
                        `(select (price*((100-discount)::numeric/100)))::numeric(10,2)`,
                    ),
                    "discountPrice",
                ],
                ...(lat && lng
                    ? [
                          [sequelizeLiteralDistance(lat, lng), "distance"],
                          [sequelizeLiteralTerinary(lat, lng, 0), "status"],
                      ]
                    : [[sequelize.literal("(select false)"), "status"]]),
            ],
            where: {
                discount: {
                    [Op.gte]: ds ? ds : 0,
                    [Op.lte]: de ? de : 100,
                },
            },
            include: [
                {
                    model: Product,
                    required: true,
                    attributes: [
                        "id",
                        "name",
                        "image",
                        "categoryId",
                        "brandId",
                    ],
                    include: [Brand],
                    where: {
                        name: { [Op.iLike]: `%${search}%` },
                        categoryId:
                            catArray.length != 0
                                ? { [Op.in]: catArray }
                                : categoryId
                                ? { [Op.eq]: categoryId }
                                : { [Op.not]: null },
                        brandId: brandId
                            ? { [Op.eq]: brandId }
                            : { [Op.not]: null },
                    },
                },
                { model: Varient, attributes: ["id", "mrp", "volume"] },
                {
                    model: Shop,
                    attributes: ["id", "name"],
                    include: {
                        model: SellerAuth,
                        required: true,
                        attributes: [],
                    },
                    required: true,
                    where: {
                        rating: {
                            [Op.gte]: rs ? rs : 0,
                            [Op.lte]: re ? re : 5,
                        },
                    },
                },
            ],
            order: lat && lng ? [sequelize.col("product.name")] : [],
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

module.exports = FilterQueries;
