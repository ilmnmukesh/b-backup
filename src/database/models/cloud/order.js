module.exports = (sequelize, DataTypes) => {
    const CloudOrder = sequelize.define("cloud_order", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        totalAmount: { type: DataTypes.DECIMAL(8, 2) },
        subTotal: { type: DataTypes.DECIMAL(8, 2) },
        taxes: { type: DataTypes.DECIMAL(8, 2) },
        convenienceFee: { type: DataTypes.DECIMAL(8, 2) },
        referenceId: { type: DataTypes.STRING },
        status: {
            type: DataTypes.ENUM(["created", "waiting", "cancelled"]),
            defaultValue: "created",
        },
    });
    return { CloudOrder };
};
