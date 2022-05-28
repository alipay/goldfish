import { Compiler, EntryPlugin, Compilation, sources, Chunk } from 'webpack'
import fs from 'fs'
import { parseQuery } from 'loader-utils'
import path, { resolve } from 'path'
import { ampEntry } from '../entry'
import { parseAmpConf } from '../ampConf'
import { runtimeCodeFixBabel, runtimeCodeCtxObject } from '../constants'
import { getRelativeOutput, createRelativePath } from '../utils'
import { platformConf } from '../ampConf/default-conf'

const { outputRoot, style, platform } = parseAmpConf()

export default class AmpWebpackPlugin {
  compiler: Compiler
  compilation: Compilation

  // 动态添加入口
  applyAppEntry() {
    const { xml, css, json } = platformConf[platform].ext

    ampEntry.entryOutputMap.forEach((output, loc) => {
      // https://webpack.js.org/plugins/internal-plugins/#entryplugin
      const out = getRelativeOutput(output)

      // js 文件
      new EntryPlugin(this.compiler.context, loc, out).apply(this.compiler)

      // 需要检验文件存不存在
      const userExts = [style]
      const exts = [css, json, xml, ...userExts]

      exts.forEach((ext) => {
        if (fs.existsSync(resolve(this.compiler.context, loc + ext))) {
          const fi = loc + (ext = ext === json ? `${json}?asConfig` : ext)
          new EntryPlugin(this.compiler.context, fi, out).apply(this.compiler)
        }
      })
    })
  }

  // chunk 添加依赖
  applyChunkRequire() {
    // https://github.com/didi/mpx/blob/c034d454986fe1f932784f26295d59328da951c3/packages/webpack-plugin/lib/index.js#L1145
    this.compiler.hooks.thisCompilation.tap(
      'AmpWebpackPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'AmpWebpackPlugin',
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
          },
          () => {
            const { globalObject, chunkLoadingGlobal } =
              compilation.outputOptions

            const processedChunk = new Set()
            const appName = 'app'

            function processChunk(
              chunk: Chunk,
              isRuntime: boolean,
              relativeChunks: Chunk[]
            ) {
              const chunkFile = chunk.files.values().next().value
              if (!chunkFile || processedChunk.has(chunk)) return

              let originalSource = compilation.assets[chunkFile]
              const source = new sources.ConcatSource()
              source.add(`\nvar ${globalObject} = ${globalObject} || {};\n\n`)

              relativeChunks.forEach((relativeChunk, index) => {
                const relativeChunkFile = relativeChunk.files
                  .values()
                  .next().value
                if (!relativeChunkFile) return

                const x = (chunk) => (chunk[0] === '/' ? '' : '/') + chunk
                const relativePath = createRelativePath(
                  path.relative(
                    path.dirname(resolve(outputRoot) + x(chunkFile)),
                    resolve(outputRoot) + x(relativeChunkFile)
                  )
                )

                if (index === 0) {
                  if (chunk.name === appName) {
                    source.add(runtimeCodeCtxObject)
                    source.add(
                      `context[${JSON.stringify(
                        chunkLoadingGlobal
                      )}] = ${globalObject}[${JSON.stringify(
                        chunkLoadingGlobal
                      )}] = require("${relativePath}");\n`
                    )
                  } else {
                    // 其余chunk中通过context全局传递runtime
                    source.add(runtimeCodeCtxObject)
                    source.add(
                      `${globalObject}[${JSON.stringify(
                        chunkLoadingGlobal
                      )}] = context[${JSON.stringify(chunkLoadingGlobal)}];\n`
                    )
                  }
                } else {
                  source.add(`require("${relativePath}");\n`)
                }
              })

              if (isRuntime) {
                source.add(runtimeCodeCtxObject)
                source.add(runtimeCodeFixBabel)
                source.add(originalSource)
                source.add(
                  `\nmodule.exports = ${globalObject}[${JSON.stringify(
                    chunkLoadingGlobal
                  )}];\n`
                )
              } else {
                source.add(originalSource)
              }

              compilation.assets[chunkFile] = source
              processedChunk.add(chunk)
            }

            compilation.chunkGroups.forEach((chunkGroup) => {
              if (!chunkGroup.isInitial()) return

              let runtimeChunk, entryChunk
              const middleChunks: any = []

              const chunksLength = chunkGroup.chunks.length

              chunkGroup.chunks.forEach((chunk, index) => {
                if (index === 0) {
                  runtimeChunk = chunk
                } else if (index === chunksLength - 1) {
                  entryChunk = chunk
                } else {
                  middleChunks.push(chunk)
                }
              })

              if (runtimeChunk) {
                processChunk(runtimeChunk, true, [])
                if (middleChunks.length) {
                  middleChunks.forEach((middleChunk) => {
                    processChunk(middleChunk, false, [runtimeChunk])
                  })
                }
                if (entryChunk) {
                  middleChunks.unshift(runtimeChunk)
                  processChunk(entryChunk, false, middleChunks)
                }
              }
            })
          }
        )
      }
    )
  }

  // 编译过程中, 新增入口
  dynamicEntry() {
    this.compiler.hooks.thisCompilation.tap(
      'AmpWebpackPlugin ',
      (compilation) => {
        this.compilation = compilation
      }
    )

    this.compiler.hooks.normalModuleFactory.tap(
      'AmpWebpackPlugin',
      (normalModuleFactory) => {
        normalModuleFactory.hooks.beforeResolve.tap(
          'AmpWebpackPlugin',
          ({ request }) => {
            const queryIndex = request.indexOf('?')
            let resourcePath = request
            let resourceQuery = ''

            if (queryIndex >= 0) {
              resourcePath = request.slice(0, queryIndex)
              resourceQuery = request.slice(queryIndex)
            }
            const { type, output } = parseQuery(resourceQuery || '?')
            if (type === 'entry') {
              const dep = EntryPlugin.createDependency(
                resourcePath,
                path.parse(resourcePath).name
              )
              this.compilation.addEntry(
                this.compiler.context,
                dep,
                output,
                (e, res) => { }
              )
            }
          }
        )
      }
    )
  }

  apply(compiler: Compiler) {
    this.compiler = compiler
    this.applyAppEntry()
    this.applyChunkRequire()
    this.dynamicEntry()
  }
}
