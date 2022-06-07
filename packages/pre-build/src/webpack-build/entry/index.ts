import { resolve, isAbsolute, parse, join } from 'path';
import { jsonExt, MAIN_PACKAGE, useComp } from '../constants';
import { Entry, EntryType } from '../types';

class AmpEntry {
  entries: Entry[] = []; // 所有引用关系
  entryOutputMap: Map<string, string> = new Map(); // 输入与输出
  resourceMap: Map<string, Entry[]> = new Map(); // 当前文件引用了哪些资源

  sourceRoot = '';
  outputRoot = '';

  init(sourceRoot: string, outputRoot: string, appEntry: string) {
    this.sourceRoot = sourceRoot;
    this.outputRoot = outputRoot;

    const appJson = this.getJson(appEntry);

    if (appJson.pages) {
      appJson.pages.forEach(page => this.addPage(page, MAIN_PACKAGE));
    }

    if (appJson.subPackages) {
      appJson.subPackages.forEach(pkg => {
        const { root, pages } = pkg;
        pages.forEach(page => this.addPage(page, root));
      });
    }
  }

  getBaseOutput(p: string) {
    const { sourceRoot, outputRoot } = this;
    return p.replace(sourceRoot, outputRoot);
  }

  getRelativeOutput(p: string) {
    const { outputRoot } = this;
    return p.replace(resolve(outputRoot), '');
  }

  // 获取某源码文件的应当的输出目录
  getResourceOutput(resourcePath: string, relative?: boolean): string {
    const { dir, name, ext } = parse(resourcePath);
    const pathNoExt = `${dir}/${name}`;
    const outputDir = this.entryOutputMap.get(pathNoExt) || this.getBaseOutput(pathNoExt);
    const output = `${outputDir}${ext}`;
    return relative ? this.getRelativeOutput(output) : output;
  }

  getResourceEntries(resourcePath: string): Entry[] {
    const { dir } = parse(resourcePath);
    return this.resourceMap.get(dir) || [];
  }

  private addEntry(options: Entry) {
    this.entries.push(options);
    this.entryOutputMap.set(options.loc, options.output);
    const caller = this.resourceMap.get(options.caller) || [];
    this.resourceMap.set(options.caller, caller.concat(options));
  }

  private getJson(_path) {
    const { name, dir, ext } = parse(_path);
    try {
      if (ext) return require(resolve(dir, `${name}${jsonExt}`));
      return require(resolve(dir, name) + jsonExt);
    } catch {
      return {};
    }
  }

  addPage(page = '', pkg = MAIN_PACKAGE) {
    const loc = this.pagePathResolve(page, pkg);

    const entry = {
      type: EntryType.page,
      pkg,
      value: page,
      key: page,
      loc,
      name: parse(join(loc, '..')).name,
      output: this.getBaseOutput(loc),
      caller: parse(loc).dir,
    };

    this.addEntry(entry);
    this.travelComponents(loc, pkg);

    return entry;
  }

  private travelComponents(loc, pkg) {
    const json = this.getJson(loc);
    const compMap = json[useComp];

    if (compMap) {
      Object.entries(compMap).forEach(([key, value]) => {
        this.addComponent(key, value as string, pkg, parse(loc).dir);
      });
    }
  }

  private getOutputCompName(entry: string) {
    return `${parse(join(entry, '..')).name.toLowerCase()}`;
  }

  private getOutputCompPath(sourcePath: string) {
    return resolve(this.outputRoot, sourcePath.replace(this.sourceRoot, '/'));
  }

  addComponent(key, value, pkg = MAIN_PACKAGE, caller) {
    const loc = this.compPathResolve(value, caller);
    const name = this.getOutputCompName(loc);
    const output = this.getOutputCompPath(loc);

    const entry = {
      type: EntryType.comp,
      pkg,
      name,
      value,
      loc,
      output,
      key,
      caller,
    };

    this.addEntry(entry);
    this.travelComponents(loc, pkg);
    return entry;
  }

  pagePathResolve(page, pkg = MAIN_PACKAGE) {
    return resolve(this.sourceRoot, pkg === MAIN_PACKAGE ? '' : pkg, page);
  }

  compPathResolve(comp, currentDir) {
    // 组件写成绝对路径，性能会高一些
    if (isAbsolute(comp)) {
      return resolve(this.sourceRoot) + comp;
    }

    try {
      // 兼容 monorepos 结构
      const { dir, name } = parse(require.resolve(comp + jsonExt));
      return resolve(dir, name);
    } catch (e) {
      // 处理 ../../ 路径
      return join(currentDir, comp);
    }
  }
}

export const ampEntry = new AmpEntry();
