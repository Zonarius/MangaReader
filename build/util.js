"use strict";
function prepareConfig(config) {
    config.rootPath = convertWindowsPaths(config.rootPath);
    return config;
}
exports.prepareConfig = prepareConfig;
function convertWindowsPaths(windowsPath) {
    const driveLetterRE = /(.*?):\\/;
    const backslashRE = /\\/g;
    let result = driveLetterRE.exec(windowsPath);
    if (!result) {
        return windowsPath;
    }
    let driveLetter = result[1].toLowerCase();
    return "/mnt/" + driveLetter + "/" +
        windowsPath.substr(3).replace("\\", "/");
}
function defaultConfig() {
    return {
        port: 8080,
        rootPath: "G:\\Downloads\\Part 7 - Steel Ball Run (Official Color Scans)",
        imageFileExtensions: ["png", "jpg"]
    };
}
exports.defaultConfig = defaultConfig;
function cullUndefined(o) {
    Object.keys(o)
        .filter(k => typeof o[k] === 'undefined')
        .forEach(k => {
        delete o[k];
    });
    return o;
}
exports.cullUndefined = cullUndefined;
