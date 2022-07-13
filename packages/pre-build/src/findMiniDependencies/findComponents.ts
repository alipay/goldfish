import * as path from 'path';
import * as fs from 'fs-extra';
import * as lodash from 'lodash';
import ensurePath from './ensurePath';
import resolveModuleInSourceDir from './resolveModuleInSourceDir';
import fileCache from './fileCache';

type Component = {
  configName: string;
  configPath: string;
  configFilePath: string;
  jsPath: string;
  axmlPath: string;
  acssPath: string | undefined;
  jsonPath: string;
};

export default function findComponents(jsonPath: string, projectDir: string) {
  return fileCache.run('findComponents', jsonPath, () => {
    const json: { usingComponents?: Record<string, string> } = fs.readJSONSync(jsonPath);
    const usingComponents = json.usingComponents || {};

    const components: Array<Component> = [];
    for (const key in usingComponents) {
      const item: Component = {
        configName: key,
        configPath: usingComponents[key],
        configFilePath: jsonPath,
        jsPath: '',
        axmlPath: '',
        acssPath: undefined,
        jsonPath: '',
      };
      if (item.configPath.startsWith('/')) {
        item.jsPath = path.resolve(projectDir, `${item.configPath.replace(/^\//, '')}.js`);
      } else {
        const configFilePathDir = path.parse(item.configFilePath).dir;
        item.jsPath = resolveModuleInSourceDir(item.configPath, configFilePathDir, projectDir) || '';
      }

      if (!fs.existsSync(item.jsPath)) {
        item.jsPath = path.resolve(item.jsPath.replace(/\.js$/, ''), './index.js');
        if (!fs.existsSync(item.jsPath)) {
          throw new Error(
            `Can not find the component \`${item.configPath}\` in config file: \`${item.configFilePath}\`.`,
          );
        }
      }

      item.axmlPath = item.jsPath.replace(/\.js/, '.axml');
      item.acssPath = ensurePath(item.jsPath.replace(/\.js/, '.acss'));
      item.jsonPath = item.jsPath.replace(/\.js/, '.json');

      components.push(item, ...(item.jsonPath ? findComponents(item.jsonPath, projectDir) : []));
    }

    const result = lodash.uniqBy(components, component => component.jsPath);
    return result;
  });
}
