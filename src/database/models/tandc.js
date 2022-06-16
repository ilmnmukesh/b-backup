const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const TermsAndCondition = sequelize.define("tandc", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: { type: DataTypes.STRING },
        description: {
            type: DataTypes.TEXT,
        },
    });
    return { TermsAndCondition };
};
