const { ResponseObj } = require("./response");

const decorator = (func) => {
    const innerFunction = async (req, res) => {
        const response = new ResponseObj();
        try {
            await func(req, response, res);
        } catch (e) {
            console.log(e);
            response.errors = e.message ? e.message : e;
            response.description = "Something went wrong";
        }
        res.status(200).send(response);
    };
    return innerFunction;
};

module.exports = decorator;
