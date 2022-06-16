module.exports = (app) => {
    app.use(function (req, res, next) {
        try {
            let [type, token] = req.headers.authorization.split(" ");
            if (
                type == "Boozeo" &&
                token == "4f2e899d0f4d1096c8e415a8326e6cdc98a5787c"
            )
                next();
            else {
                throw new Error("Unauthorized");
            }
        } catch {
            res.status(401).send({
                detail: "Authentication credentials were not provided.",
            });
            res.end();
        }
    });
};
