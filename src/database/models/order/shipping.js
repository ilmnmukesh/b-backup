module.exports = (sequelize, DataTypes) => {
    const ShippingDetails = sequelize.define("shipping_detail", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
        },
        city: {
            type: DataTypes.STRING(100),
        },
        address: {
            type: DataTypes.TEXT,
        },
        state: {
            type: DataTypes.STRING(50),
        },
        country: {
            type: DataTypes.STRING(20),
        },
        postalCode: {
            type: DataTypes.INTEGER,
        },
    });
    return { ShippingDetails };
};
