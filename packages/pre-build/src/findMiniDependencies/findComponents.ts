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
        item.jsPath = ensurePath(path.resolve(projectDir, `${item.configPath.replace(/^\//, '')}`), ['.js', '.ts'])!;
      } else {
        const configFilePathDir = path.parse(item.configFilePath).dir;
        item.jsPath = resolveModuleInSourceDir(item.configPath, configFilePathDir, projectDir) || '';
      }

      const ext = path.extname(item.jsPath);
      const getFilePath = _ext => item.jsPath.replace(new RegExp(`\\${ext}$`), _ext);

      if (!fs.existsSync(item.jsPath)) {
        item.jsPath = path.resolve(getFilePath(''), `./index${ext}`);
        if (!fs.existsSync(item.jsPath)) {
          throw new Error(
            `Can not find the component \`${item.configPath}\` in config file: \`${item.configFilePath}\`.`,
          );
        }
      }

      item.axmlPath = getFilePath('.axml');
      item.acssPath = ensurePath(getFilePath(''), ['.acss', '.less']);
      item.jsonPath = getFilePath('.json');

      components.push(item, ...(item.jsonPath ? findComponents(item.jsonPath, projectDir) : []));
    }

    const result = lodash.uniqBy(components, component => component.jsPath);
    return result;
  });
}
