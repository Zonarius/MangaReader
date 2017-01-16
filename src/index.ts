import * as express from 'express';
import * as nunjucks from 'nunjucks';
import * as serveIndex from 'serve-index';
import * as fs from 'fs';
import * as pathfs from 'path';
import * as commander from 'commander';

import * as util from './util';

main(parseCommandLine());

function main(config: Config) {
  util.prepareConfig(config);
  let app = express();

  nunjucks.configure(__dirname + '/views', {
    express: app
  })

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
  })

  app.listen(config.port, () => console.log(`listening on port ${config.port}`));

  function getMangaFiles(directory: string): string[] {
    let path = getPath(directory);
    let files = fs.readdirSync(path);

    return files.filter(file => {
      return config.imageFileExtensions.some(ext => file.endsWith("." + ext))
    })
      .map(file => pathfs.join(directory, file))
  }

  function getPath(path: string): string {
    return config.rootPath + decodeURIComponent(path);
  }
}

function parseCommandLine(): Config {
  commander
    .option('-c, --config <path>', 'set config path')
    .parse(process.argv);
  let cmdConfig,
    envConfig,
    defaultConfig = util.defaultConfig();

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
  console.dir(cmdConfig);
  console.dir(envConfig);
  console.dir(defaultConfig);

  return Object.assign({}, defaultConfig, envConfig, cmdConfig);
}