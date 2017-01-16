import * as express from 'express';
import * as nunjucks from 'nunjucks';
import * as serveIndex from 'serve-index';
import * as fs from 'fs';
import * as pathfs from 'path';

import * as util from './util';

let config: Config = {
  port: 8080,
  rootPath: "G:\\Downloads\\Part 7 - Steel Ball Run (Official Color Scans)",
  imageFileExtensions: ["png", "jpg"]
}

main(config);
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

