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

export function defaultConfig(): Config {
  return {
    port: 8080,
    rootPath: "G:\\Downloads\\Part 7 - Steel Ball Run (Official Color Scans)",
    imageFileExtensions: ["png", "jpg"]
  }
}

export function cullUndefined(o: Object) : Object {
  Object.keys(o)
    .filter(k => typeof o[k] === 'undefined')
    .forEach(k => {
      delete o[k];
    })
  return o;
}