const app = require("express").Router();
const { uuidValidator } = require("../../others/validation");
app.use("/socket/order/:id/:cid/", (req, res) => {
    try {
        uuidValidator(req.params.cid);
        const io = req.app.get("socketio");
        const path =
            "order_tracking_" + req.params.id + "_ecom_" + req.params.cid;
        // io.on("connection", (soc) => {
        //     soc.on(path, (data) => {
        //         console.log(data);
        //         io.emit(path, data);
        //     });
        // });
        io.emit(path, {
            success: false,
            data: { status: null },
        });
        res.json({ a: 10 });
        console.log(io.listeners("connection"));
        console.log(io.listeners(path));
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
});

module.exports = app;
