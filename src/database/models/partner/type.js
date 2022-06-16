module.exports = (sequelize, DataTypes) => {
    const PartnerType = sequelize.define("partner_type", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    });
    return { PartnerType };
};
