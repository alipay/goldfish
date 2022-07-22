import * as fs from 'fs-extra';

export default function ensurePath(p: string) {
  if (fs.existsSync(p)) {
    return p;
  }
}
