export function prepareConfig(config: Config): Config {
  config.rootPath = convertWindowsPaths(config.rootPath);
  return config;
}

function convertWindowsPaths(windowsPath: string) {
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