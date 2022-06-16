module.exports = (AdminBro) => {
    const verify = require("./verify")(AdminBro);
    //console.log(verify);
    return { verify };
};
