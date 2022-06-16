module.exports = (sequelize, DataTypes) => {
    const Brand = sequelize.define(
        "brand",
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
            logo: {
                type: DataTypes.TEXT,
            },
        },
        {
            timestamps: false,
        }
    );
    return { Brand };
};
