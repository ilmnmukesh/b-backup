module.exports = (sequelize, DataTypes) => {
    const updatePartnerLocation = async (obj, opt) => {
        // console.log(obj, opt);
        const partner = await obj.getPartner();
        if (partner != null) {
            partner.latitude = latitude;
            partner.longitude = longitude;
            await partner.save();
        }
    };
    const Shop = sequelize.define(
        "shop",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            image: {
                type: DataTypes.TEXT,
            },
            location: {
                type: DataTypes.TEXT,
            },
            mobileNumber: {
                type: DataTypes.STRING(20),
            },
            telephoneNumber: {
                type: DataTypes.STRING(20),
            },
            authozisationCode: {
                type: DataTypes.STRING,
            },
            since: {
                type: DataTypes.DATEONLY,
            },
            sellerName: {
                type: DataTypes.STRING(50),
            },
            about: {
                type: DataTypes.TEXT,
            },
            discountProvide: { type: DataTypes.INTEGER, defaultValue: 0 },
            isPreferred: { type: DataTypes.BOOLEAN, defaultValue: false },
            rating: {
                type: DataTypes.FLOAT,
            },
            openTime: {
                type: DataTypes.TIME,
            },
            closeTime: {
                type: DataTypes.TIME,
            },
            star: {
                type: DataTypes.INTEGER,
            },
            latitude: {
                type: DataTypes.FLOAT,
            },
            longitude: {
                type: DataTypes.FLOAT,
            },
            noOfSeats: {
                type: DataTypes.INTEGER,
            },
        },
        {
            hooks: {
                afterCreate: updatePartnerLocation,
                afterUpdate: updatePartnerLocation,
            },
        },
    );
    return { Shop };
};
