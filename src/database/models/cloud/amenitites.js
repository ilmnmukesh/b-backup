module.exports = (sequelize, DataTypes) => {
    const Amenitites = sequelize.define(
        "amenitites",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: { type: DataTypes.STRING, unique: true, allowNull: false },
        },
        { timestamps: false }
    );

    const AmenititesMenu = sequelize.define(
        "amenitites_menu",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
        },
        { timestamps: false }
    );
    return { Amenitites, AmenititesMenu };
};
