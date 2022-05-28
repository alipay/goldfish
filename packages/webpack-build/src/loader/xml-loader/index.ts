import path from 'path'
import fs from 'fs-extra'
import attrParse from './attr-parse'
import { ampEntry } from '../../entry'
import { getBaseOutput, getRelativeOutput, isRelativeUrl } from '../../utils'
import { addQuery, AssetQuery } from '../addQuery'
import { parseAmpConf, platformConf } from '../../ampConf'

const { sourceRoot, platform, style } = parseAmpConf()
const assetSet = new Set()

module.exports = function xmlLoader(source) {
  const { dir } = path.parse(this.resourcePath)
  const output = ampEntry.getResourceOutput(this.resourcePath)
  const { css, json } = platformConf[platform].ext

  const attributes = [
    'image:src',
    'audio:src',
    'video:src',
    'cover-image:src',
    'import:src',
    'include:src',
    'import-sjs:from',
  ]

  const links = attrParse(source, (tag, attr) => {
    const res = attributes.find((a) => {
      if (a.charAt(0) === ':') {
        return attr === a.slice(1)
      } else {
        return tag + ':' + attr === a
      }
    })
    return !!res
  })

  const assets: AssetQuery[] = []

  // 解析 xml 中的相对路径资源进行拷贝
  links
    .filter((link) => isRelativeUrl(link.value))
    .forEach((link) => {
      let currentPath = ''
      let outputPath = ''
      if (path.isAbsolute(link.value)) {
        currentPath = path.resolve(sourceRoot) + link.value
        outputPath = getBaseOutput(currentPath)
      } else {
        currentPath = path.join(dir, link.value)
        outputPath = path.join(path.parse(output).dir, link.value)
      }

      // 如果是模板或者引用
      // https://opendocs.alipay.com/mini/framework/axml-template
      const template = ['import', 'include']
      if (!assetSet.has(currentPath) && template.includes(link.tag)) {
        const { dir, name } = path.parse(currentPath)
        const { dir: outDir } = path.parse(outputPath)

        const userExts = [style]
        const exts = [css, json, ...userExts]

        // js/ts 不需要 ext，需要加入独立的 entry
        assets.push({
          resource: `${dir}/${name}`,
          options: {
            output: getRelativeOutput(`${outDir}/${name}`),
            type: 'entry',
          },
        })

        exts.forEach((ext) => {
          let file = `${dir}/${name}${ext}`
          if (fs.existsSync(file)) {
            file = `${file}${ext === json ? '?asConfig' : ''}`
            assets.push({
              resource: file,
              options: { output: getRelativeOutput(`${outDir}/${name}${ext}`) },
            })
          }
        })

        assetSet.add(currentPath)
      }

      assets.push({
        resource: currentPath,
        options: { output: getRelativeOutput(outputPath) },
      })
    })

  this.emitFile(getRelativeOutput(output), source)

  return addQuery(assets)
}
