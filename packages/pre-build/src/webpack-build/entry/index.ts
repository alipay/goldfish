import { resolve, isAbsolute, parse, join } from 'path'
import hash from 'hash-sum'
import { jsonExt, MAIN_PACKAGE, useComp } from '../constants'
import { Entry, EntryType } from '../types'
import { getBuildOptions } from '../ampConf'
import { getBaseOutput, getRelativeOutput } from '../utils'

const { sourceRoot, outputRoot, appEntry } = getBuildOptions()

class AmpEntry {
  entries: Entry[] = [] // 所有引用关系
  entryOutputMap: Map<string, string> = new Map() // 输入与输出
  resourceMap: Map<string, Entry[]> = new Map() // 当前文件引用了哪些资源

  constructor() {
    const appJson = this.getJson(appEntry)

    if (appJson.pages) {
      appJson.pages.forEach((page) => this.addPage(page, MAIN_PACKAGE))
    }

    if (appJson.subPackages) {
      appJson.subPackages.forEach((pkg) => {
        const { root, pages } = pkg
        pages.forEach((page) => this.addPage(page, root))
      })
    }
  }

  // 获取某源码文件的应当的输出目录
  getResourceOutput(resourcePath: string, relative?: boolean): string {
    const { dir, name, ext } = parse(resourcePath)
    const pathNoExt = `${dir}/${name}`
    const outputDir =
      this.entryOutputMap.get(pathNoExt) || getBaseOutput(pathNoExt)
    const output = `${outputDir}${ext}`
    return relative ? getRelativeOutput(output) : output
  }

  getResourceEntries(resourcePath: string): Entry[] {
    const { dir } = parse(resourcePath)
    return this.resourceMap.get(dir) || []
  }

  private addEntry(options: Entry) {
    this.entries.push(options)
    this.entryOutputMap.set(options.loc, options.output)
    const caller = this.resourceMap.get(options.caller) || []
    this.resourceMap.set(options.caller, caller.concat(options))
  }

  private getJson(_path) {
    const { name, dir, ext } = parse(_path)
    try {
      if (ext) return require(resolve(dir, `${name}${jsonExt}`))
      return require(resolve(dir, name) + jsonExt)
    } catch {
      return {}
    }
  }

  addPage(page = '', pkg = MAIN_PACKAGE) {
    const loc = this.pagePathResolve(page, pkg)

    const entry = {
      type: EntryType.page,
      pkg,
      value: page,
      key: page,
      loc,
      name: parse(join(loc, '..')).name,
      output: getBaseOutput(loc),
      caller: parse(loc).dir,
    }

    this.addEntry(entry)
    this.travelComponents(loc, pkg)

    return entry
  }

  private travelComponents(loc, pkg) {
    const json = this.getJson(loc)
    const compMap = json[useComp]

    if (compMap) {
      Object.entries(compMap).forEach(([key, value]) => {
        this.addComponent(key, value as string, pkg, parse(loc).dir)
      })
    }
  }

  private getOutputCompName(entry) {
    // hash 处理为了防止命名重复
    return `${parse(join(entry, '..')).name.toLowerCase()}-${hash(entry)}`
  }

  addComponent(key, value, pkg = MAIN_PACKAGE, caller) {
    const loc = this.compPathResolve(value, caller)
    const name = this.getOutputCompName(loc)
    // 所有组件都输出到 output 下的 components 目录中
    const output = resolve(outputRoot) + `/components/${name}/index`

    const entry = {
      type: EntryType.comp,
      pkg,
      name,
      value,
      loc,
      output,
      key,
      caller,
    }

    this.addEntry(entry)
    this.travelComponents(loc, pkg)
    return entry
  }

  pagePathResolve(page, pkg = MAIN_PACKAGE) {
    return resolve(sourceRoot, pkg === MAIN_PACKAGE ? '' : pkg, page)
  }

  compPathResolve(comp, currentDir) {
    // 组件写成绝对路径，性能会高一些
    if (isAbsolute(comp)) {
      return resolve(sourceRoot) + comp
    }

    try {
      // 兼容 monorepos 结构
      const { dir, name } = parse(require.resolve(comp + jsonExt))
      return resolve(dir, name)
    } catch (e) {
      // 处理 ../../ 路径
      return join(currentDir, comp)
    }
  }
}

export const ampEntry = new AmpEntry()
