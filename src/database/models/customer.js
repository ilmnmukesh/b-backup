const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize) => {
    const Customer = sequelize.define(
        "customer",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: "Anonymous",
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING(100),
                validate: {
                    isEmail: true,
                },
            },
            mobileNumber: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            tierExpires: {
                type: DataTypes.DATEONLY,
                defaultValue: new Date(),
            },
            dateOfBirth: {
                type: DataTypes.DATEONLY,
                // defaultValue: new Date(),
                // get() {
                //     return moment(this.getDataValue("dateOfBirth")).format(
                //         "DD/MM/YYYY"
                //     );
                // },
                // set(value) {
                //     this.setDataValue(
                //         "dateOfBirth",
                //         moment(value, "DD/MM/YYYY").format("YYYY-MM-DD")
                //     );
                // },
            },
            latitude: {
                type: DataTypes.FLOAT,
            },
            longitude: {
                type: DataTypes.FLOAT,
            },
            profileUrl: {
                type: DataTypes.TEXT,
            },
            countryCode: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "91",
            },
            isUpdated: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            paymentId: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            verificationId: {
                type: DataTypes.STRING(32),
                defaultValue: null,
            },
            verificationExpires: {
                type: DataTypes.DATE,
                defaultValue: new Date(),
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ["mobileNumber", "countryCode"],
                },
            ],
            hooks: {
                afterCreate: async (obj) => {
                    try {
                        const { Token } = require("..");
                        await Token.create({
                            customerId: obj.id,
                            key: Buffer.from(obj.id).toString("base64"),
                        });
                    } catch (e) {
                        console.log(e);
                    }
                },
            },
        },
    );
    const ProfileInfo = sequelize.define("profile_info", {
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
        },
        city: {
            type: DataTypes.STRING(100),
        },
        address: {
            type: DataTypes.TEXT,
        },
        state: {
            type: DataTypes.STRING(50),
        },
        country: {
            type: DataTypes.STRING(20),
        },
        postalCode: {
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
        },
        countryCode: { type: DataTypes.STRING(2) },
        stateCode: { type: DataTypes.STRING(2) },
        defaultSelect: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        title: {
            type: DataTypes.STRING(100),
        },
        latitude: {
            type: DataTypes.FLOAT,
        },
        longitude: {
            type: DataTypes.FLOAT,
        },
    });
    return { Customer, ProfileInfo };
};
