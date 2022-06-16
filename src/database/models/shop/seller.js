module.exports = (sequelize, DataTypes) => {
    // const { Sequelize } = require("sequelize");
    // const sequelize = new Sequelize();
    const SellerAuth = sequelize.define(
        "seller_auth",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            accountId: {
                type: DataTypes.STRING,
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            salt: { type: DataTypes.STRING, defaultValue: "md5" },
            password: DataTypes.STRING,
        },
        {
            hooks: {
                afterCreate: async (obj) => {
                    const crypto = require("crypto");
                    const { Shop } = require("../..");

                    var hmac = crypto.createHmac("sha256", obj.salt);
                    obj.isVerified = false;
                    obj.password = hmac.update(obj.password).digest("hex");
                    if (obj.shopId == null) {
                        const shop = await Shop.create({ name: obj.email });
                        obj.shopId = shop.id;
                    }
                    await obj.save();
                },
            },
        },
    );
    return { SellerAuth };
};
