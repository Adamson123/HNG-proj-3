const app = require("./index");

const { sequelize } = require("./models");

const port = process.env.PORT || 3003;
app.listen(port, async () => {
    console.log("server! server!! server!!! is on " + port);
    await sequelize.authenticate();
    console.log("db is connected");
});
