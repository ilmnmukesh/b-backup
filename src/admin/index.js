const AdminBro = require("adminjs");
const AdminBroExpress = require("@adminjs/express");
const AdminBroSequelize = require("@adminjs/sequelize");
const pages = require("./pages")(AdminBro);
const resources = require("./resources");
AdminBro.registerAdapter(AdminBroSequelize);

const { sequelize } = require("../database");
//const theme = require("./theme");
// AdminBro.ACTIONS.show.isAccessible = ({ currentAdmin, resources, record }) => {
//     console.log(currentAdmin, resources, record);
//     return currentAdmin && currentAdmin.role == "superuser";
// };
module.exports = (app) => {
    const adminBro = new AdminBro({
        databases: [sequelize],
        // resources: resources,
        dashboard: {
            handler: async (a) => {
                // console.log("asdhd", a);
                return {};
            },
            component: AdminBro.bundle("./views/dashboard"),
        },
        rootPath: "/admin",
        branding: {
            companyName: "Boozeo",
            logo: process.env.HOST + "/images/logo.png",
            softwareBrothers: false,
            //theme: theme,
        },
        locale: {
            translations: {
                labels: {
                    loginWelcome: "",
                },
                messages: {
                    loginWelcome: "",
                },
            },
        },

        assets: {
            scripts: [
                "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js",
                process.env.HOST + "/main.js",
            ],
        },
        pages: pages,
        env: {
            HOST: process.env.HOST,
        },
    });
    //const authenticate = require("./authenticate")(AdminBroExpress, adminBro);
    //app.use(adminBro.options.rootPath, authenticate);

    const router = AdminBroExpress.buildRouter(adminBro);

    return router;
};
