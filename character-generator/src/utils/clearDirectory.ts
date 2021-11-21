import fs from 'fs';

export function clearDirectory(directory: string) {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true });
  } else {
    fs.mkdirSync(directory, { recursive: true });
  }
}
