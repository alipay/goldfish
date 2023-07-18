import * as fs from 'fs-extra';
import utils from '../utils';

export class FileCache {
  private recorder = new Map<
    string,
    Map<string, { value: any; lastModifiedTime: number; cacheExpiredTime?: number }>
  >();

  run<R>(group: string, filePath: string, fn: () => R, options?: { cacheTime: number }): R {
    const result = this.recorder.get(group)?.get(filePath);
    const lastModifiedTime = fs.statSync(filePath).mtime.getTime();
    const isExpired = !result || lastModifiedTime > result.lastModifiedTime;
    if (isExpired) {
      if (!this.recorder.has(group)) {
        this.recorder.set(group, new Map());
      }
      const value = fn();
      const cacheTime = options?.cacheTime;
      const cacheExpiredTime = !cacheTime || cacheTime <= 0 ? 30 * 60 * 1000 : Date.now() + cacheTime;
      this.recorder.get(group)?.set(filePath, { value, lastModifiedTime, cacheExpiredTime });
    }
    const ret = this.recorder.get(group)?.get(filePath)?.value;
    try {
      this.releaseOldFiles();
    } catch (e) {
      utils.warn('Release memory failed.', e);
    }
    return ret;
  }

  clear() {
    this.recorder.clear();
  }

  private releaseOldFiles() {
    this.recorder.forEach((fileMap, group) => {
      fileMap.forEach((item, filePath) => {
        const { cacheExpiredTime } = item;
        if (cacheExpiredTime && cacheExpiredTime >= Date.now()) {
          this.recorder.get(group)?.delete(filePath);
        }
      });
    });
  }
}

export default new FileCache();
