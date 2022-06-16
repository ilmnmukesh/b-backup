module.exports = (sequelize, DataTypes) => {
    const CloudWallet = sequelize.define(
        "cloud_wallet",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            noOfShots: { type: DataTypes.INTEGER },
            shotsLeft: { type: DataTypes.INTEGER },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ["varientId", "customerId"],
                },
            ],
        }
    );
    return { CloudWallet };
};
