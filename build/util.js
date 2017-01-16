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
//# sourceMappingURL=util.js.map