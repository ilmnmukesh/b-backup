module.exports = (sequelize, DataTypes) => {
    const CloudCart = sequelize.define(
        "cloud_carts",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            count: {
                type: DataTypes.INTEGER,
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ["shopId", "varientId", "customerId"],
                },
            ],
        }
    );
    return { CloudCart };
};
