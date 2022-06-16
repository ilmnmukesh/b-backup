module.exports = (sequelize, DataTypes) => {
    const Partner = sequelize.define(
        "partner",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.VIRTUAL,
            },
            image: {
                type: DataTypes.VIRTUAL,
            },
            location: {
                type: DataTypes.VIRTUAL,
            },
            mobileNumber: {
                type: DataTypes.VIRTUAL,
            },
            telephoneNumber: {
                type: DataTypes.VIRTUAL,
            },
            authozisationCode: {
                type: DataTypes.VIRTUAL,
            },
            since: {
                type: DataTypes.VIRTUAL,
            },
            sellerName: {
                type: DataTypes.VIRTUAL,
            },
            stateCode: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            countryCode: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            postalCode: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            about: {
                type: DataTypes.VIRTUAL,
            },
            discountProvide: {
                type: DataTypes.VIRTUAL,
            },
            isPreferred: {
                type: DataTypes.VIRTUAL,
            },
            rating: {
                type: DataTypes.VIRTUAL,
            },
            openTime: {
                type: DataTypes.VIRTUAL,
            },
            closeTime: {
                type: DataTypes.VIRTUAL,
            },
            star: {
                type: DataTypes.VIRTUAL,
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
            salt: {
                type: DataTypes.STRING,
                defaultValue: "md5",
            },
            password: {
                type: DataTypes.STRING,
            },
            latitude: {
                type: DataTypes.FLOAT,
            },
            longitude: {
                type: DataTypes.FLOAT,
            },
        },
        {
            hooks: {
                afterFind: async (obj) => {
                    const data = async (obj) => {
                        const shop = await obj?.getShop();
                        if (shop == null) return;
                        obj.name = shop.name;
                        obj.image = shop.image;
                        obj.location = shop.location;
                        obj.mobileNumber = shop.mobileNumber;
                        obj.telephoneNumber = shop.telephoneNumber;
                        obj.authozisationCode = shop.authozisationCode;
                        obj.since = shop.since;
                        obj.sellerName = shop.sellerName;
                        obj.about = shop.about;
                        obj.discountProvide = shop.discountProvide;
                        obj.isPreferred = shop.isPreferred;
                        obj.rating = shop.rating;
                        obj.openTime = shop.openTime;
                        obj.closeTime = shop.closeTime;
                        obj.star = shop.star;
                        obj.password = null;
                        obj.salt = null;
                        return obj;
                    };
                    if (Array.isArray(obj)) {
                        for (const o of obj) {
                            data(o);
                        }
                    } else {
                        return data(obj);
                    }
                },
                afterCreate: async (obj) => {
                    const crypto = require("crypto");
                    const { Shop } = require("../..");
                    var hmac = crypto.createHmac("sha256", obj.salt);
                    obj.isVerified = false;
                    obj.password = hmac.update(obj.password).digest("hex");
                    if (obj.shopId == null) {
                        const shop = await Shop.create({ name: obj.email });
                        obj.shopId = shop.id;
                    } else {
                        const shop = await obj.getShop();
                        obj.latitude = shop.latitude;
                        obj.longitude = shop.longitude;
                    }
                    await obj.save();
                },
            },
        },
    );

    return { Partner };
};
