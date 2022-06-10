import fs from 'fs-extra';

export class FileCache {
  private recorder = new Map<string, Map<string, { value: any; lastModifiedTime: number }>>();

  run<R>(group: string, filePath: string, fn: () => R): R {
    const result = this.recorder.get(group)?.get(filePath);
    const lastModifiedTime = fs.statSync(filePath).mtime.getTime();
    const isExpired = !result || lastModifiedTime > result.lastModifiedTime;
    if (isExpired) {
      if (!this.recorder.has(group)) {
        this.recorder.set(group, new Map());
      }
      const value = fn();
      this.recorder.get(group)?.set(filePath, { value, lastModifiedTime });
    }
    return this.recorder.get(group)?.get(filePath)?.value;
  }
}

export default new FileCache();
