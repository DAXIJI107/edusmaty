const fs = require("fs");
const path = require("path");
const vm = require("vm");

function collectJavaScriptFiles(root) {
    return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
        const target = path.join(root, entry.name);
        if (entry.isDirectory()) return collectJavaScriptFiles(target);
        return entry.isFile() && entry.name.endsWith(".js") ? [target] : [];
    });
}

const files = [
    "server.js",
    "config.js",
    "db.js",
    "middleware.js",
    ...collectJavaScriptFiles("src"),
    ...collectJavaScriptFiles("scripts"),
    ...collectJavaScriptFiles("ops/database/migrations"),
    ...collectJavaScriptFiles("test"),
    ...collectJavaScriptFiles("apps/web/public/js")
];

let failed = false;

for (const file of files) {
    try {
        const source = fs.readFileSync(file, "utf8").replace(/^#!.*\r?\n/, "");
        new vm.Script(source, { filename: file });
    } catch (error) {
        failed = true;
        console.error(error.stack || error.message);
    }
}

process.exit(failed ? 1 : 0);
