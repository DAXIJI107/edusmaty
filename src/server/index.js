const config = require("../config");
const { createApp } = require("./app");

const app = createApp();
const PORT = config.server.port;

app.listen(PORT, () => {
    console.log(`EduSmart rebuild running at http://localhost:${PORT}`);
});

module.exports = app;
