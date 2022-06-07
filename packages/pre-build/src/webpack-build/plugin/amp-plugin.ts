import fs from 'fs';
import path from 'path';
import { Compiler, EntryPlugin, Compilation, sources, Chunk } from 'webpack';
import { parseQuery } from 'loader-utils';
import ampEntry from '../ampEntry';
import { runtimeCodeFixBabel, runtimeCodeCtxObject, regeneratorRuntimeFix } from '../constants';
import { createRelativePath } from '../utils';
import { error } from '../../utils';

export default class AmpWebpackPlugin {
  // 动态添加入口
  applyAppEntry(compiler: Compiler) {
    const { xml, json } = { xml: '.axml', json: '.json' };

    ampEntry.entryOutputMap.forEach((output, loc) => {
      // https://webpack.js.org/plugins/internal-plugins/#entryplugin
      const out = ampEntry.getRelativeOutput(output);

      // js 文件
      new EntryPlugin(compiler.context, loc, out).apply(compiler);

      // 需要检验文件存不存在
      const exts = [json, xml];

      exts.forEach(ext => {
        if (fs.existsSync(path.resolve(compiler.context, loc + ext))) {
          const fi = loc + (ext = ext === json ? `${json}?asConfig` : ext);
          new EntryPlugin(compiler.context, fi, out).apply(compiler);
        }
      });
    });
  }

  // chunk 添加依赖
  applyChunkRequire(compiler: Compiler) {
    // https://github.com/didi/mpx/blob/c034d454986fe1f932784f26295d59328da951c3/packages/webpack-plugin/lib/index.js#L1145
    compiler.hooks.thisCompilation.tap('AmpWebpackPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'AmpWebpackPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const { globalObject, chunkLoadingGlobal } = compilation.outputOptions;

          const processedChunk = new Set();
          const appName = 'app';

          function processChunk(chunk: Chunk, isRuntime: boolean, relativeChunks: Chunk[]) {
            const chunkFile = chunk.files.values().next().value;
            if (!chunkFile || processedChunk.has(chunk)) return;

            let originalSource = compilation.assets[chunkFile];
            const isRegeneratorRuntime = /regeneratorRuntime/.test(originalSource.source().toString());
            const source = new sources.ConcatSource();
            source.add(`\nvar ${globalObject} = ${globalObject} || {};\n\n`);
            if (isRegeneratorRuntime) source.add(regeneratorRuntimeFix);

            relativeChunks.forEach((relativeChunk, index) => {
              const relativeChunkFile = relativeChunk.files.values().next().value;
              if (!relativeChunkFile) return;

              const x = (chunk: any) => (chunk[0] === '/' ? '' : '/') + chunk;
              const relativePath = createRelativePath(
                path.relative(
                  path.dirname(path.resolve(ampEntry.outputRoot) + x(chunkFile)),
                  path.resolve(ampEntry.outputRoot) + x(relativeChunkFile),
                ),
              );

              if (index === 0) {
                if (chunk.name === appName) {
                  source.add(runtimeCodeCtxObject);
                  source.add(
                    `context[${JSON.stringify(chunkLoadingGlobal)}] = ${globalObject}[${JSON.stringify(
                      chunkLoadingGlobal,
                    )}] = require("${relativePath}");\n`,
                  );
                } else {
                  // 其余chunk中通过context全局传递runtime
                  source.add(runtimeCodeCtxObject);

                  source.add(
                    `${globalObject}[${JSON.stringify(chunkLoadingGlobal)}] = context[${JSON.stringify(
                      chunkLoadingGlobal,
                    )}];\n`,
                  );
                }
              } else {
                source.add(`require("${relativePath}");\n`);
              }
            });

            if (isRuntime) {
              source.add(runtimeCodeCtxObject);

              source.add(runtimeCodeFixBabel);
              source.add(originalSource);
              source.add(`\nmodule.exports = ${globalObject}[${JSON.stringify(chunkLoadingGlobal)}];\n`);
            } else {
              source.add(originalSource);
            }

            compilation.assets[chunkFile] = source;
            processedChunk.add(chunk);
          }

          compilation.chunkGroups.forEach(chunkGroup => {
            if (!chunkGroup.isInitial()) return;

            let runtimeChunk: any, entryChunk: any;
            const middleChunks: any = [];

            const chunksLength = chunkGroup.chunks.length;

            chunkGroup.chunks.forEach((chunk, index) => {
              if (index === 0) {
                runtimeChunk = chunk;
              } else if (index === chunksLength - 1) {
                entryChunk = chunk;
              } else {
                middleChunks.push(chunk);
              }
            });

            if (runtimeChunk) {
              processChunk(runtimeChunk, true, []);
              if (middleChunks.length) {
                middleChunks.forEach((middleChunk: any) => {
                  processChunk(middleChunk, false, [runtimeChunk]);
                });
              }
              if (entryChunk) {
                middleChunks.unshift(runtimeChunk);
                processChunk(entryChunk, false, middleChunks);
              }
            }
          });
        },
      );
    });
  }

  // 编译过程中, 新增入口
  dynamicEntry(compiler: Compiler) {
    let compilation: Compilation | null = null;
    compiler.hooks.thisCompilation.tap('AmpWebpackPlugin ', c => {
      compilation = c;
    });

    compiler.hooks.normalModuleFactory.tap('AmpWebpackPlugin', normalModuleFactory => {
      normalModuleFactory.hooks.beforeResolve.tap('AmpWebpackPlugin', ({ request }) => {
        const queryIndex = request.indexOf('?');
        let resourcePath = request;
        let resourceQuery = '';

        if (queryIndex >= 0) {
          resourcePath = request.slice(0, queryIndex);
          resourceQuery = request.slice(queryIndex);
        }
        const { type, output } = parseQuery(resourceQuery || '?') as { type: string; output: string };

        if (type === 'entry') {
          if (!compilation) {
            throw new Error('The compilation is not ready.');
          }

          compilation.addEntry(
            compiler.context,
            EntryPlugin.createDependency(resourcePath, path.parse(resourcePath).name),
            output,
            e => {
              if (e) {
                error(e);
              }
            },
          );
        }
      });
    });
  }

  apply(compiler: Compiler) {
    this.applyAppEntry(compiler);
    this.applyChunkRequire(compiler);
    this.dynamicEntry(compiler);
  }
}
