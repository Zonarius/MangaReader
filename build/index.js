"use strict";
const express = require("express");
const nunjucks = require("nunjucks");
const serveIndex = require("serve-index");
const fs = require("fs");
const pathfs = require("path");
const commander = require("commander");
const alphanumSort = require("alphanum-sort");
const util = require("./util");
main(parseCommandLine());
function main(config) {
    util.prepareConfig(config);
    let app = express();
    nunjucks.configure(__dirname + '/views', {
        express: app
    });
    app.use("/", (req, res, next) => {
        let path = getPath(req.path);
        if (!fs.existsSync(path)) {
            res.status(404);
            res.end();
            return;
        }
        if (fs.lstatSync(path).isFile()) {
            res.sendFile(path);
            return;
        }
        let mangaFiles = getMangaFiles(req.path);
        if (mangaFiles.length == 0) {
            return serveIndex(config.rootPath)(req, res, next);
        }
        res.render('manga.html', Object.assign({ images: mangaFiles }, getNavigation(path)));
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
    function getNavigation(path) {
        let chapters = getAbsoluteFolders(pathfs.dirname(path));
        let chapterIndex = chapters.indexOf(path);
        let ret = {};
        ret.prev = chapters[chapterIndex - 1];
        ret.next = chapters[chapterIndex + 1];
        if (!ret.prev) {
            let upDir = pathfs.resolve(path, "..");
            let volumes = getAbsoluteFolders(pathfs.dirname(upDir));
            let volumeIndex = volumes.indexOf(upDir);
            if (volumeIndex != 0) {
                let prevVolume = volumes[volumeIndex - 1];
                let prevChapters = getAbsoluteFolders(prevVolume);
                ret.prev = prevChapters[prevChapters.length - 1];
            }
        }
        if (!ret.next) {
            let upDir = pathfs.resolve(path, "..");
            let volumes = getAbsoluteFolders(pathfs.dirname(upDir));
            let volumeIndex = volumes.indexOf(upDir);
            if (volumeIndex != volumes.length - 1) {
                let nextVolume = volumes[volumeIndex + 1];
                let nextChapters = getAbsoluteFolders(nextVolume);
                ret.next = nextChapters[0];
            }
        }
        if (ret.prev) {
            ret.prev = "/" + pathfs.relative(config.rootPath, ret.prev);
        }
        if (ret.next) {
            ret.next = "/" + pathfs.relative(config.rootPath, ret.next);
        }
        return ret;
    }
}
function getAbsoluteFolders(path) {
    return alphanumSort(fs.readdirSync(path)
        .map(node => pathfs.join(path, node))
        .filter(node => fs.lstatSync(node).isDirectory()));
}
function parseCommandLine() {
    commander
        .option('-c, --config <path>', 'set config path')
        .parse(process.argv);
    let cmdConfig, envConfig, defaultConfig = util.defaultConfig();
    if (commander["config"]) {
        let path = commander["config"];
        if (!fs.existsSync(path)) {
            throw "Could not find config file " + path;
        }
        if (!fs.lstatSync(path).isFile()) {
            throw "Provided config path is not a file";
        }
        let fileContent = fs.readFileSync(path, "utf-8");
        cmdConfig = JSON.parse(fileContent);
    }
    envConfig = util.cullUndefined({
        rootPath: process.env.ROOTPATH,
        port: process.env.PORT
    });
    return Object.assign({}, defaultConfig, envConfig, cmdConfig);
}
