import { resolve, isAbsolute, parse, join } from 'path';
import { EntryObject } from 'webpack';
import { jsonExt, MAIN_PACKAGE, useComp } from './constants';
import { Entry, EntryType } from './types';

class AmpEntry {
  entries: Entry[] = [];
  entryOutputMap: Map<string, string> = new Map();
  resourceMap: Map<string, Entry[]> = new Map();

  sourceRoot = '';
  outputRoot = '';

  sjsEntryObject: EntryObject = {};

  init(sourceRoot: string, outputRoot: string, appEntry: string) {
    this.sourceRoot = sourceRoot;
    this.outputRoot = outputRoot;

    const appJson: { pages?: string[]; subPackages?: Array<{ root: string; pages: string[] }> } =
      this.getJson(appEntry);

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

  clearEntryOutputMap() {
    this.entryOutputMap.clear();
  }

  addSjsEntry(name: string, p: string) {
    this.sjsEntryObject[name.replace(this.outputRoot + '/', '').replace(/\.sjs$/, '')] = p
      .replace(this.sourceRoot + '/', './')
      .replace(/\.sjs$/, '');
  }

  getBaseOutput(p: string) {
    const { sourceRoot, outputRoot } = this;
    return p.replace(sourceRoot, outputRoot);
  }

  getRelativeOutput(p: string) {
    const { outputRoot } = this;
    return p.replace(outputRoot, '');
  }

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

  private getJson(p: string) {
    const { name, dir, ext } = parse(p);
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

  private travelComponents(loc: string, pkg: string) {
    const json: { usingComponents?: Record<string, string> } = this.getJson(loc);
    const compMap = json[useComp];

    if (compMap) {
      Object.entries(compMap).forEach(([key, value]) => {
        this.addComponent(key, value, pkg, parse(loc).dir);
      });
    }
  }

  private getOutputCompName(entry: string) {
    return `${parse(join(entry, '..')).name.toLowerCase()}`;
  }

  private getOutputCompPath(sourceCodePath: string, caller: string) {
    if (sourceCodePath.startsWith('/')) {
      return resolve(this.outputRoot, sourceCodePath.replace(/^\//, ''));
    }
    return resolve(caller, sourceCodePath);
  }

  addComponent(key: string, value: string, pkg = MAIN_PACKAGE, caller: string) {
    const loc = this.compPathResolve(value, caller);
    const name = this.getOutputCompName(loc);
    const output = this.getOutputCompPath(value, caller);

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

  compPathResolve(comp: string, currentDir: string) {
    if (isAbsolute(comp)) {
      return resolve(this.sourceRoot) + comp;
    }

    try {
      // Compatible with the monorepo projects
      const { dir, name } = parse(require.resolve(comp + jsonExt));
      return resolve(dir, name);
    } catch (e) {
      // handle the path: `../../`
      return join(currentDir, comp);
    }
  }

  destroy() {
    this.entries = [];
    this.entryOutputMap.clear();
    this.resourceMap.clear();
    this.sjsEntryObject = {};
    this.sourceRoot = '';
    this.outputRoot = '';
  }
}

const ampEntry = new AmpEntry();
export default ampEntry;
