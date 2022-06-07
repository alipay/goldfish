import { parseQuery } from 'loader-utils';
import ampEntry from '../ampEntry';
import { useComp } from '../constants';
import { jsonModule, normalizeCompPath } from '../utils';
import { addQuery, Query } from './addQuery';

module.exports = function (this: any, source: any) {
  if (this.resourceQuery) {
    const { asConfig } = parseQuery(this.resourceQuery);

    // 配置类的 json 需要在路径后加 asConfig 参数
    if (asConfig) {
      const queries: Query[] = [];
      const jsonSource = JSON.parse(source);
      const compMap = jsonSource[useComp];

      if (compMap) {
        // 当前资源文件的引用
        const entries = ampEntry.getResourceEntries(this.resourcePath);

        Object.entries(compMap).forEach(([key, value]) => {
          let entry = entries.find(i => key === i.key && value === i.value);

          if (entry) {
            compMap[key] = normalizeCompPath(entry.name);
          }
        });
      }

      return addQuery(queries);
    }
  }

  return jsonModule(source);
};
