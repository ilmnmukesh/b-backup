module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define(
        "category",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            code: {
                type: DataTypes.STRING,
            },
        },
        {
            timestamps: false,
        }
    );
    return { Category };
};
