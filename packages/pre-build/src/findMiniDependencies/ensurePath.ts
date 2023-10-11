import * as fs from 'fs-extra';

export default function ensurePath(p: string, exts: string[] = []) {
  if (fs.existsSync(p)) {
    return p;
  }

  if(exts.length) {
    for(let i = 0; i < exts.length; i++) {
      const file = p + exts[i]
        if (fs.existsSync(file)) {
          return file;
        }
    }
  }
}
