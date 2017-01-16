interface Config {
  rootPath: string;
  port: number;
  imageFileExtensions: string[];
}

interface FolderNavigation {
  next?: string;
  prev?: string;
}