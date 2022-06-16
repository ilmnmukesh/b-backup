module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define("review", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: { type: DataTypes.STRING },
        comment: { type: DataTypes.TEXT },
        rating: { type: DataTypes.FLOAT },
    });
    return { Review };
};
