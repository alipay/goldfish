import fs from 'fs-extra';
import { ResolverFactory, FileSystem } from 'enhanced-resolve';

function getCallback(...args: any[]) {
  let callback: Function | undefined = undefined;
  if (typeof args[1] === 'function') {
    callback = args[1];
  }
  if (typeof args[2] === 'function') {
    callback = args[2];
  }
  return callback;
}
const fileSystem: FileSystem = {
  readFile(...args: any[]) {
    const callback = getCallback(...args);
    try {
      const content = fs.readFileSync(args[0], args[1]);
      callback && callback(null, content);
    } catch (e) {
      callback && callback(e);
    }
  },
  readdir(...args: any[]) {
    const callback = getCallback(...args);
    try {
      const content = fs.readdirSync(args[0], args[1]);
      callback && callback(null, content);
    } catch (e) {
      callback && callback(e);
    }
  },
  readlink(...args: any[]) {
    const callback = getCallback(...args);
    try {
      const content = fs.readlinkSync(args[0], args[1]);
      callback && callback(null, content);
    } catch (e) {
      callback && callback(e);
    }
  },
  lstat(...args: any[]) {
    const callback = getCallback(...args);
    try {
      const content = fs.lstatSync(args[0], args[1]);
      callback && callback(null, content);
    } catch (e) {
      callback && callback(e);
    }
  },
  stat(...args: any[]) {
    const callback = getCallback(...args);
    try {
      const content = fs.statSync(args[0], args[1]);
      callback && callback(null, content);
    } catch (e) {
      callback && callback(e);
    }
  },
};
const resolver = ResolverFactory.createResolver({
  fileSystem,
  mainFields: ['browser', 'module', 'main'],
  conditionNames: ['import', 'require', 'browser', 'node'],
});

export default function resolveModule(request: string, options?: { paths?: string[] }) {
  const paths = options?.paths || [process.cwd()];

  for (let i = 0, il = paths.length; i < il; i++) {
    try {
      return resolver.resolveSync({}, paths[i], request) || undefined;
    } catch (e) {
      continue;
    }
  }

  return;
}
