const { User, TermsAndCondition, ProfileInfo } = require("../../database");
const otpQueries = require("./otp");

const userQueries = {
    async createUser(params) {
        const query = await User.findAll({
            where: {
                countryCode: params.countryCode,
                mobileNumber: params.mobileNumber,
            },
        });
        if (query.length == 0) {
            const result = await User.create({
                firstName: params.firstName,
                lastName: params.lastName,
                email: params.email,
                profileUrl: params.profileUrl,
                dateOfBirth: params.dateOfBirth,
                mobileNumber: params.mobileNumber,
                countryCode: params.countryCode,
                countryName: params.countryName,
            });
            return [true, result, {}, "Mobile number registered successfully"];
        }
        return [
            false,
            {},
            { mobileNumber: "mobile number already registered" },
            "Mobile number already registered",
        ];
    },
    async createOrCheck(mobileNumber, countryCode) {
        const [check, details] = await otpQueries.checkCustomer(
            countryCode,
            mobileNumber,
        );
        if (check) {
            let data = await User.create({
                countryCode: countryCode,
                mobileNumber: mobileNumber,
            });
            return [true, data];
        }
        return [false, details];
    },
    async termsAndCondition() {
        return await TermsAndCondition.findAll({
            attributes: { exclude: ["id"] },
        });
    },
    async getUser(customerId) {
        return await User.findByPk(customerId);
    },

    async listProfileInfo(customerId) {
        return await ProfileInfo.findAll({ where: { customerId: customerId } });
    },
    async createProfileInfo(details, customerId) {
        if (details.defaultSelect) {
            await ProfileInfo.update(
                { defaultSelect: false },
                { where: { customerId: customerId } },
            );
        }
        return await ProfileInfo.create(details);
    },
    async updateProfileInfo(details, profileId) {
        if (details.defaultSelect != undefined && details.defaultSelect) {
            await ProfileInfo.update(
                { defaultSelect: false },
                { where: { customerId: details.customerId } },
            );
        }
        await ProfileInfo.update(details, {
            where: { id: profileId },
        });
        return await ProfileInfo.findByPk(profileId);
    },
    async deleteProfileInfo(profileId) {
        let res = await ProfileInfo.findByPk(profileId);
        if (res == null) return false;
        if (res.defaultSelect) {
            let upd = await ProfileInfo.findOne({
                where: { customerId: res.customerId },
            });
            if (upd != null) {
                upd.defaultSelect = true;
                upd.save();
            }
        }
        res.destroy();
        return true;
    },
    async getProfileInfo(customerId) {
        return await ProfileInfo.findOne({
            where: { customerId: customerId, defaultSelect: true },
        });
    },
    async updateDefaultSelect(profileId) {
        let res = await ProfileInfo.findByPk(profileId);
        if (res != null) {
            await ProfileInfo.update(
                { defaultSelect: false },
                {
                    where: { customerId: res.customerId },
                },
            );
            res.defaultSelect = true;
            await res.save();
        }
        return res;
    },
    async getProfile(profileId) {
        return await ProfileInfo.findByPk(profileId);
    },

    async updateUserLocation(customerId, lat, lng) {
        let cust = await User.findByPk(customerId);
        if (cust == null) throw "Customer does not exists";
        cust.latitude = lat;
        cust.longitude = lng;
        cust.save();
        return true;
    },
    async getUserDetails(customerId) {
        let cust = await User.findByPk(customerId);
        if (cust == null) throw "Customer does not exists";
        return cust;
    },
};
module.exports = userQueries;
