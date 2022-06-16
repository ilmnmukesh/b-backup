module.exports = (app) => {
    const morgan = require("morgan");

    app.use(
        morgan(function (tokens, req, res) {
            let date = tokens.date("clf");
            let version = tokens["http-version"](req, res);
            let method = tokens.method(req, res);
            let status = tokens.status(req, res);
            let url = tokens.url(req, res);
            let resTime =
                tokens.res(req, res, "content-length") -
                tokens["response-time"](req, res);
            return `[${date}] ${method} ${url} HTTP/${version} ${status} ${resTime}ms`;
        })
    );
};
