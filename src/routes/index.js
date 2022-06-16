const adminConfig = require("../admin");
const mobile = require("../mobile");
const dashboard = require("../dashboard");
const hooks = require("../hooks");
const partners = require("../partners");
module.exports = (app) => {
    mobile(app);
    const admin = adminConfig(app);
    // app.use("/admin", (req, res) => {
    //     res.send("100");
    // });
    app.use("/admin", admin);
    app.use("/hooks", hooks);
    dashboard(app);
    partners(app);
};
