require("dotenv").config();
const DB = require("./src/database");

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
const load = async (filename, model) => {
    try {
        let data = await require(filename);
        for (let x = 0; x < data.length; x++) {
            await model.create(data[x]);
        }
    } catch (e) {
        console.log(e);
    }
};
//brands
// categories
// countries
// multiplers
// products
// shops
// units
// varients
(async () => {
    await load("./dummy/premium.json", DB.Premium);
    await load("./dummy/delivery_type.json", DB.DeliveryType);
    await load("./dummy/user.json", DB.Customer);
    await load("./dummy/brand.json", DB.Brand);
    await load("./dummy/category.json", DB.Category);
    await load("./dummy/unit.json", DB.Unit);
    await load("./dummy/state.json", DB.ShopState);
    await load("./dummy/shop.json", DB.Shop);
    await load("./dummy/partners.json", DB.Partner);
    await load("./dummy/seller_auth.json", DB.SellerAuth);
    await load("./dummy/multipler.json", DB.Multipler);
    await load("./dummy/admin.json", DB.Admin);
    await load("./dummy/product.json", DB.Product);
    await load("./dummy/varient.json", DB.Varient);
    await load("./dummy/shop_product.json", DB.Post);
    await load("./dummy/shop_type.json", DB.ShopType);
    await load("./dummy/best_drinks.json", DB.BestDrink);
    await load("./dummy/tandq.json", DB.TermsAndCondition);
    await load("./dummy/menu_type.json", DB.MenuType);
    await load("./dummy/menu_item.json", DB.MenuItem);
    await load("./dummy/event.json", DB.Event);
    await load("./dummy/event_images.json", DB.EventImage);
    await load("./dummy/amenitites.json", DB.Amenitites);
    await load("./dummy/amenitites_menu.json", DB.AmenititesMenu);
    await load("./dummy/reviews.json", DB.Review);
    // d = await DB.Varient.findAll({
    //     include: [DB.Product],
    //     raw: true,
    //     nest: true,
    // });
    // d = await DB.Shop.findAll({
    //     include: [
    //         {
    //             model: DB.Product,
    //             where: {
    //                 categoryId: 1,
    //             },
    //             include: {
    //                 model: DB.Category,
    //             },
    //             raw: true,
    //             nest: true,
    //         },
    //     ],
    //     where: { id: 1 },
    //     raw: true,
    //     nest: true,
    // });
    // console.log(d);
    // d = await DB.Shop.findAll({
    //     include: [
    //         {
    //             model: DB.Category,
    //         },
    //     ],
    // });
    // d.map(async (e) => {
    //     z = await e.getCategories();
    //     console.log(JSON.parse(JSON.stringify(z)));
    // });
    // d = await DB.BestDrink.findAll({
    //     include: [
    //         {
    //             model: DB.Product,
    //         },
    //     ],
    // });
    // console.log(JSON.parse(JSON.stringify(d)));
    // var res = await DB.User.create({
    //     mobileNumber: "8610631155",
    //     countryCode: 91,
    // });
    //console.log(res);
    // console.log(
    //     JSON.parse(
    //         JSON.stringify(
    //             await DB.Cart.findOne({
    //                 include: { model: DB.Varient, include: DB.Product },
    //             })
    //         )
    //     )
    // );
    // console.log(
    //     JSON.parse(
    //         JSON.stringify(
    //             await DB.Order.create(
    //                 {
    //                     totalAmount: 120,
    //                     subTotal: 99,
    //                     shippingCost: 20,
    //                     taxes: 1,
    //                     convenienceFee: 0,
    //                     tipForDriver: 0,
    //                     customerId: "4660a786-ce8d-40e1-b74d-5d2e10f161ec",
    //                     referenceId: "abcd",
    //                     order_products: [
    //                         {
    //                             price: 20,
    //                             quantity: 5,
    //                             varientId:
    //                                 "514ddd8b-48c3-4ccb-99de-ca654e7b0d2c",
    //                         },
    //                     ],
    //                 },
    //                 { include: [DB.OrderProduct] }
    //             )
    //         )
    //     )
    // );
})();

// (async () => {
//     const lat = 12.979999;
//     const lng = 80.126028;

//     // const location = DB.sequelize.literal(
//     //     `ST_GeomFromText('POINT(${lng} ${lat})')`
//     // );
//     // const distance = DB.sequelize.fn(
//     //     "ST_Distance_Sphere",
//     //     DB.sequelize.col("location"),
//     //     location
//     // );

//     // await DB.User.findAll({
//     //     order: distance,
//     //     where: DB.sequelize.where(distance),
//     //     logging: console.log,
//     // });
//     //SELECT "id", "firstName", "lastName", "email", "mobileNumber", "dateOfBirth", "latitude", "longitude", "profileUrl", "countryCode", "isUpdated", "isVerified", "paymentId", "createdAt", "updatedAt" FROM "customers" AS "customer" WHERE ST_Distance_Sphere("location", ST_GeomFromText('POINT(13.4619422 59.3225525)')) IS NULL ;
//     const { Op } = require("sequelize");
//     // console.log(
//     //     //JSON.parse(
//     //     JSON.stringify(
//     //         await DB.Product.findAll({
//     //             where: { id: 10 },
//     //             include: [
//     //                 {
//     //                     model: DB.Shop,
//     //                     where: DB.sequelize.where(
//     //                         DB.sequelize.literal(
//     //                             "6371 * acos(cos(radians(" +
//     //                                 lat +
//     //                                 ")) * cos(radians(latitude)) * cos(radians(" +
//     //                                 lng +
//     //                                 ") - radians(longitude)) + sin(radians(" +
//     //                                 lat +
//     //                                 ")) * sin(radians(latitude)))"
//     //                         ),
//     //                         {
//     //                             [Op.lte]: 25,
//     //                         }
//     //                     ),
//     //                 },
//     //             ],
//     //             order: [
//     //                 [
//     //                     DB.sequelize.literal(
//     //                         "6371 * acos(cos(radians(" +
//     //                             lat +
//     //                             ")) * cos(radians(latitude)) * cos(radians(" +
//     //                             lng +
//     //                             ") - radians(longitude)) + sin(radians(" +
//     //                             lat +
//     //                             ")) * sin(radians(latitude)))"
//     //                     ),
//     //                     "DESC",
//     //                 ],
//     //             ],
//     //             //order: DB.sequelize.col("shops.distance"),
//     //             logging: console.log,
//     //         })
//     //     )
//     //     //)
//     // );

//     console.log(
//         JSON.parse(
//             JSON.stringify(
//                 await DB.Product.findAll({
//                     where: { categoryId: 1 },
//                     nest: true,
//                     raw: true,
//                     include: [
//                         {
//                             model: DB.Shop,
//                             where: DB.sequelize.where(
//                                 DB.sequelize.literal(
//                                     "6371 * acos(cos(radians(" +
//                                         lat +
//                                         ")) * cos(radians(latitude)) * cos(radians(" +
//                                         lng +
//                                         ") - radians(longitude)) + sin(radians(" +
//                                         lat +
//                                         ")) * sin(radians(latitude)))"
//                                 ),
//                                 {
//                                     [Op.lte]: 25,
//                                 }
//                             ),
//                         },
//                     ],
//                 })
//             )
//         )
//     );
// })();

//Executing (default):
//select * from (SELECT "product"."id", "product"."name", "product"."description", "product"."image", "product"."createdAt", "product"."updatedAt", "product"."categoryId", "product"."brandId", "shops"."id" AS "shops.id", 6371 * acos(cos(radians(59.3225525)) * cos(radians(latitude)) * cos(radians(13.4619422) - radians(longitude)) + sin(radians(59.3225525)) * sin(radians(latitude))) AS "shops.distance", "shops->shop_product"."id" AS "shops.shop_product.id", "shops->shop_product"."createdAt" AS "shops.shop_product.createdAt", "shops->shop_product"."updatedAt" AS "shops.shop_product.updatedAt", "shops->shop_product"."shopId" AS "shops.shop_product.shopId", "shops->shop_product"."productId" AS "shops.shop_product.productId"FROM "products" AS "product" LEFT OUTER JOIN ( "shop_products" AS "shops->shop_product" INNER JOIN "shops" AS "shops" ON"shops"."id" = "shops->shop_product"."shopId") ON "product"."id" = "shops->shop_product"."productId") as foo where "shops.distance">=100;
//
//Executing (default): SELECT "product"."id", "product"."name", "product"."description", "product"."image", "product"."createdAt", "product"."updatedAt", "product"."categoryId", "product"."brandId", "shops"."id" AS "shops.id", 6371 * acos(cos(radians(59.3225525)) * cos(radians(latitude)) * cos(radians(13.4619422) - radians(longitude)) + sin(radians(59.3225525)) * sin(radians(latitude))) AS "shops.distance", "shops->shop_product"."id" AS "shops.shop_product.id", "shops->shop_product"."createdAt" AS "shops.shop_product.createdAt", "shops->shop_product"."updatedAt" AS "shops.shop_product.updatedAt", "shops->shop_product"."shopId" AS "shops.shop_product.shopId", "shops->shop_product"."productId" AS "shops.shop_product.productId"FROM "products" AS "product" LEFT OUTER JOIN ( "shop_products" AS "shops->shop_product" INNER JOIN "shops" AS "shops" ON"shops"."id" = "shops->shop_product"."shopId") ON "product"."id" = "shops->shop_product"."productId" WHERE "product"."shops.distance" = 10;
