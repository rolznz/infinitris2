import fs from 'fs';

export function clearDirectory(directory: string) {
  if (fs.existsSync(directory)) {
    const oldOutputFiles = fs
      .readdirSync(directory)
      .filter((filename) => fs.statSync(directory + '/' + filename).isFile());
    if (oldOutputFiles.length > 0)
      for (var i = 0; i < oldOutputFiles.length; i++) {
        var filePath = directory + '/' + oldOutputFiles[i];
        fs.rmSync(filePath);
      }
  } else {
    fs.mkdirSync(directory, { recursive: true });
  }
}
