const { Admin } = require("../database");

module.exports = (AdminBroExpress, adminBro) => {
    return AdminBroExpress.buildAuthenticatedRouter(adminBro, {
        authenticate: async (email, password) => {
            console.log("E,a");
            const admin = await Admin.findOne({ where: { email } });
            //adminBro.options.rootPath = "/admin";
            if (admin && password == "1") return admin;
            return false;
        },
        cookiePassword: "some-secret-password-used-to-secure-cookie",
    });
};
