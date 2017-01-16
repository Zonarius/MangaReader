"use strict";
const express = require("express");
const nunjucks = require("nunjucks");
const serveIndex = require("serve-index");
const fs = require("fs");
const pathfs = require("path");
const util = require("./util");
let config = {
    port: 8080,
    rootPath: "G:\\Downloads\\Part 7 - Steel Ball Run (Official Color Scans)",
    imageFileExtensions: ["png", "jpg"]
};
main(config);
function main(config) {
    util.prepareConfig(config);
    let app = express();
    nunjucks.configure(__dirname + '/views', {
        express: app
    });
    app.use("/", (req, res, next) => {
        let path = getPath(req.path);
        if (fs.lstatSync(path).isFile()) {
            res.sendFile(path);
            return;
        }
        let mangaFiles = getMangaFiles(req.path);
        if (mangaFiles.length == 0) {
            return serveIndex(config.rootPath)(req, res, next);
        }
        res.render('manga.html', { images: mangaFiles });
    });
    app.listen(config.port, () => console.log(`listening on port ${config.port}`));
    function getMangaFiles(directory) {
        let path = getPath(directory);
        let files = fs.readdirSync(path);
        return files.filter(file => {
            return config.imageFileExtensions.some(ext => file.endsWith("." + ext));
        })
            .map(file => pathfs.join(directory, file));
    }
    function getPath(path) {
        return config.rootPath + decodeURIComponent(path);
    }
}
//# sourceMappingURL=index.js.map