import { resolve, join, parse } from 'path';
import fs from 'fs';
import { parseQuery } from 'loader-utils';
import { ampEntry } from '../entry';
import { getBuildOptions, platformConf } from '../ampConf';
import { useComp, empty } from '../constants';
import { getRelativeOutput, isRelativeUrl, jsonModule, normalizeCompPath } from '../utils';
import { addQuery, Query } from './addQuery';

module.exports = function (this: any, source: any) {
  const { outputRoot, sourceRoot, platform, style } = getBuildOptions();
  const { xml, css, json } = platformConf[platform].ext;

  if (this.resourceQuery) {
    const { asConfig, type } = parseQuery(this.resourceQuery);

    // 配置类的 json 需要在路径后加 asConfig 参数
    if (asConfig) {
      const queries: Query[] = [];
      const { dir: resourceDir, name: resourceName } = parse(this.resourcePath);
      const resourceLoc = join(resourceDir, resourceName);
      const jsonSource = JSON.parse(source);
      const compMap = jsonSource[useComp];

      if (compMap) {
        // 当前资源文件的引用
        const entries = ampEntry.getResourceEntries(this.resourcePath);

        // 当前文件所在的分包
        const locEntry = ampEntry.entries.find(entry => entry.loc === resourceLoc)!;

        Object.entries(compMap).forEach(([key, value]) => {
          let entry = entries.find(i => key === i.key && value === i.value);

          // watch 模式动态添加的场景
          if (!entry) {
            const loc = ampEntry.compPathResolve(value, resourceLoc);
            const hasEntry = ampEntry.entries.find(i => i.loc === loc);

            entry = ampEntry.addComponent(key, value, locEntry.pkg, resourceDir);

            // 已注册的组件
            if (!hasEntry) {
              const { loc, output } = entry;
              queries.push({
                resource: loc,
                options: {
                  output: getRelativeOutput(output),
                  type: 'entry',
                },
              });

              const exts = [css, json, xml].concat([style]);
              exts.forEach(ext => {
                const resource = resolve(loc + ext);

                // 需要检验文件存不存在
                if (fs.existsSync(resource)) {
                  queries.push({
                    resource,
                    options: {
                      output: getRelativeOutput(output) + ext,
                      type: 'entry',
                      asConfig: ext === json,
                    },
                  });
                }
              });
            }
          }

          compMap[key] = normalizeCompPath(entry.name);
        });
      }

      if (type === 'app') {
        const { dir } = parse(this.resourcePath);

        const emitAssets = function emitAssets(icon: any) {
          if (isRelativeUrl(icon)) {
            const iconPath = join(dir, icon);
            const distPath = resolve(outputRoot) + iconPath.replace(resolve(sourceRoot), empty);
            queries.push({
              resource: iconPath,
              options: {
                output: getRelativeOutput(distPath),
              },
            });
          }
        };

        // 处理 tabBar 图片资源
        if (jsonSource.tabBar) {
          jsonSource.tabBar.items.forEach((item: any) => {
            const { icon, activeIcon } = item;
            emitAssets(icon);
            emitAssets(activeIcon);
          });
        }
      }

      const output = ampEntry.getResourceOutput(this.resourcePath);

      this.emitFile(getRelativeOutput(output), JSON.stringify(jsonSource, null, 2));

      return addQuery(queries);
    }
  }

  return jsonModule(source);
};
