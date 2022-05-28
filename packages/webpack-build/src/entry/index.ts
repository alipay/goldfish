import { resolve, isAbsolute, parse, join } from 'path'
import hash from 'hash-sum'
import { jsonExt, MAIN_PACKAGE, useComp } from '../constants'
import { Entry, EntryType } from '../types'
import { parseAmpConf } from '../ampConf'
import { getBaseOutput, getRelativeOutput } from '../utils'

const { sourceRoot, outputRoot, appEntry } = parseAmpConf()

class AmpEntry {
  entries: Entry[] = [] // 所有引用关系
  entryOutputMap: Map<string, string> = new Map() // 输入与输出
  resourceMap: Map<string, Entry[]> = new Map()

  constructor() {
    const appJson = this.getJsonEntry(appEntry)

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

  private getJsonEntry(_path) {
    const { name, dir, ext } = parse(_path)
    try {
      if (ext) return require(resolve(dir, `${name}${jsonExt}`))
      return require(resolve(dir, name) + jsonExt)
    } catch {
      return {}
    }
  }

  private addPage(page = '', pkg = MAIN_PACKAGE) {
    const entry = this.pagePathResolve(page, pkg)

    this.addEntry({
      type: EntryType.page,
      pkg,
      value: page,
      key: page,
      loc: entry,
      name: parse(join(entry, '..')).name,
      output: getBaseOutput(entry),
      caller: parse(entry).dir,
    })

    this.travelComponents(entry, page, pkg)
  }

  private travelComponents(entry, page, pkg) {
    const json = this.getJsonEntry(entry)
    const compMap = json[useComp]
    if (compMap) {
      Object.entries(compMap).forEach(([key, value]) => {
        this.addComponent(key, value as string, page, pkg, parse(entry).dir)
      })
    }
  }

  private getOutputCompName(entry) {
    // hash 处理为了防止命名重复
    return `${parse(join(entry, '..')).name.toLowerCase()}-${hash(entry)}`
  }

  private addComponent(key, value, page, pkg = MAIN_PACKAGE, currentDir) {
    const entry = this.compPathResolve(value, currentDir)
    const name = this.getOutputCompName(entry)
    // 所有组件都输出到 output 下的 components 目录中
    const output = resolve(outputRoot) + `/components/${name}/index`

    this.addEntry({
      type: EntryType.comp,
      pkg,
      name,
      value,
      loc: entry,
      output,
      key,
      caller: currentDir,
    })

    this.travelComponents(entry, page, pkg)
  }

  private pagePathResolve(page, pkg = MAIN_PACKAGE) {
    return resolve(sourceRoot, pkg === MAIN_PACKAGE ? '' : pkg, page)
  }

  private compPathResolve(comp, currentDir) {
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
