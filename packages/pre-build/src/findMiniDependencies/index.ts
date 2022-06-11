import * as path from 'path';
import * as lodash from 'lodash';
import findEntries from './findEntries';
import findJsDependencyModules from './findJsDependencyModules';

export default function findAllDependecies(projectDir: string) {
  const entries = findEntries(projectDir);

  const result = lodash.flatten([
    ...entries.pages.map(page => findJsDependencyModules(page.jsPath)),
    ...entries.components.map(component => findJsDependencyModules(component.jsPath)),
    ...entries.sjsList.map(sjs => findJsDependencyModules(sjs.sjsPath)),
    ...findJsDependencyModules(path.resolve(projectDir, 'app.js')),
  ]);
  return {
    entries,
    entryDeps: lodash.uniqBy(result, dep => dep.importFilePath),
  };
}
