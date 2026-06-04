const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const config = require("../config");
const routeManifest = require("./route-manifest");
const { registerHealthRoutes } = require("./health-routes");
const { registerLegacyApiRoutes } = require("./legacy-api-routes");
const { registerWebRoutes } = require("./web-routes");

const projectRoot = path.join(__dirname, "..", "..");
const webRoot = path.join(projectRoot, "apps", "web", "public");
const appHtml = path.join(webRoot, "html", "app.html");

function mountApiRoutes(app) {
    for (const [prefix, modulePath] of routeManifest) {
        try {
            app.use(prefix, require(modulePath));
        } catch (error) {
            console.warn(`skip ${prefix}: ${error.message}`);
        }
    }
}

function createApp() {
    const app = express();

    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(cors({ origin: config.server.corsOrigin, credentials: true }));

    app.use("/css", express.static(path.join(webRoot, "css")));
    app.use("/js", express.static(path.join(webRoot, "js")));
    app.use("/images", express.static(path.join(webRoot, "images")));
    app.use("/public", express.static(webRoot));
    app.use(
        "/rag_software_engineering_bundle",
        express.static(path.join(projectRoot, "rag_software_engineering_bundle"))
    );

    mountApiRoutes(app);
    registerHealthRoutes(app);
    registerLegacyApiRoutes(app);
    registerWebRoutes(app, appHtml);

    return app;
}

module.exports = { createApp, projectRoot, webRoot };
