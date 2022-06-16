module.exports = (sequelize, DataTypes) => {
    const MenuType = sequelize.define(
        "menu_type",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            code: {
                type: DataTypes.STRING,
            },
        },
        {
            timestamps: false,
        },
    );

    const MenuItem = sequelize.define(
        "menu_item",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            image: {
                type: DataTypes.TEXT,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
        },
    );

    return { MenuItem, MenuType };
};
