import { parseQuery } from 'loader-utils'
import { resolve, join, parse } from 'path'
import { ampEntry } from '../entry'
import { parseAmpConf } from '../ampConf'
import { useComp, empty } from '../constants'
import {
  getRelativeOutput,
  isRelativeUrl,
  jsonModule,
  normalizeCompPath,
} from '../utils'
import { addQuery, AssetQuery } from './addQuery'

module.exports = function (source) {
  const { outputRoot, sourceRoot } = parseAmpConf()

  if (this.resourceQuery) {
    const assetsQuery: AssetQuery[] = []

    const { asConfig, type } = parseQuery(this.resourceQuery)
    // 配置类的 json 需要在路径后加 asConfig 参数
    if (asConfig) {
      const json = JSON.parse(source)
      const compMap = json[useComp] || {}

      // 当前资源文件的引用
      const entries = ampEntry.getResourceEntries(this.resourcePath)

      entries.forEach((entry) => {
        const { key, value, name } = entry
        if (compMap[key] !== value) return

        // 格式化组件的路径
        compMap[key] = normalizeCompPath(name)
      })

      if (type === 'app') {
        const { dir } = parse(this.resourcePath)

        function emitAssets(icon) {
          if (isRelativeUrl(icon)) {
            const iconPath = join(dir, icon)
            const distPath =
              resolve(outputRoot) + iconPath.replace(resolve(sourceRoot), empty)
            assetsQuery.push({
              resource: iconPath,
              options: {
                output: getRelativeOutput(distPath),
              },
            })
          }
        }

        // 处理 tabBar 图片资源
        if (json.tabBar) {
          json.tabBar.items.forEach((item) => {
            const { icon, activeIcon } = item
            emitAssets(icon)
            emitAssets(activeIcon)
          })
        }
      }

      const output = ampEntry.getResourceOutput(this.resourcePath)

      this.emitFile(getRelativeOutput(output), JSON.stringify(json, null, 2))

      return addQuery(assetsQuery)
    }
  }

  return jsonModule(source)
}
