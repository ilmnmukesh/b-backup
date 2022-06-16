module.exports = (sequelize, DataTypes) => {
    const CloudOrderProduct = sequelize.define("cloud_order_product", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        price: { type: DataTypes.FLOAT },
        quantity: { type: DataTypes.INTEGER },
        image: { type: DataTypes.TEXT },
        name: { type: DataTypes.STRING },
        noOfShots: { type: DataTypes.INTEGER },
    });
    return { CloudOrderProduct };
};
