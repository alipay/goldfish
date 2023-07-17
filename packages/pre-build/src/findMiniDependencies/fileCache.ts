import os from 'os';
import * as fs from 'fs-extra';
import sizeof from 'object-sizeof';
import utils from '../utils';

export class FileCache {
  private recorder = new Map<
    string,
    Map<string, { value: any; lastModifiedTime: number; cacheTime: number; cacheSize: number }>
  >();
  private minProcessMemo = 1024 * 1024 * 1024 * 8;
  private minOSMemo = 1024 * 1024 * 1024 * 8;

  run<R>(group: string, filePath: string, fn: () => R): R {
    const result = this.recorder.get(group)?.get(filePath);
    const lastModifiedTime = fs.statSync(filePath).mtime.getTime();
    const isExpired = !result || lastModifiedTime > result.lastModifiedTime;
    if (isExpired) {
      if (!this.recorder.has(group)) {
        this.recorder.set(group, new Map());
      }
      const value = fn();
      this.recorder
        .get(group)
        ?.set(filePath, { value, lastModifiedTime, cacheTime: Date.now(), cacheSize: sizeof(value) });
    }
    const ret = this.recorder.get(group)?.get(filePath)?.value;
    try {
      this.releaseOldFiles(this.getMemoToFree());
    } catch (e) {
      utils.warn('Release memory failed.', e);
    }
    return ret;
  }

  clear() {
    this.recorder.clear();
  }

  private releaseOldFiles(memoToFree: number) {
    if (memoToFree <= 0) {
      return;
    }

    const sortedArr: Array<{ group: string; filePath: string; cacheTime: number; cacheSize: number }> = [];
    this.recorder.forEach((fileMap, group) => {
      fileMap.forEach(({ cacheTime, cacheSize }, filePath) => {
        sortedArr.push({ group, filePath, cacheTime, cacheSize });
      });
    });
    sortedArr.sort((a, b) => a.cacheTime - b.cacheTime);

    let remainedMemoToFree = memoToFree;
    sortedArr.some(item => {
      this.recorder.get(item.group)?.delete(item.filePath);
      remainedMemoToFree -= item.cacheSize;
      return remainedMemoToFree <= 0;
    });
  }

  private getMemoToFree() {
    const rssMemo = process.memoryUsage.rss();
    if (rssMemo <= this.minProcessMemo) {
      return 0;
    }

    const freeMemo = os.freemem();
    return freeMemo < this.minOSMemo ? rssMemo - this.minProcessMemo : 0;
  }
}

export default new FileCache();
