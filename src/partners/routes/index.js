const app = require("express")();

app.get("/", async (req, res) => {
    res.render("partners/test", { activeState: 1 });
});

app.use("/inventory", require("./inventory"));
app.use("/order", require("./order"));
app.use("/profile", require("./profile"));

module.exports = app;
