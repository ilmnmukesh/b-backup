module.exports = (sequelize, DataTypes) => {
    const CloudHistory = sequelize.define("cloud_history", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        noOfShots: DataTypes.INTEGER,
        alphaNum: DataTypes.STRING,
        expiresIn: DataTypes.INTEGER,
        status: {
            type: DataTypes.ENUM(["processing", "expires", "redeem", "cancel"]),
            defaultValue: "processing",
        },
    });

    return { CloudHistory };
};
