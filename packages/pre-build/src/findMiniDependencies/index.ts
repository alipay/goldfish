import * as path from 'path';
import * as lodash from 'lodash';
import findEntries from './findEntries';
import findJsDependencyModules from './findJsDependencyModules';

export default function findAllDependecies(projectDir: string) {
  const entries = findEntries(projectDir);

  const result = lodash.flatten([
    ...entries.pages.map(page => findJsDependencyModules(page.jsPath, projectDir)),
    ...entries.components.map(component => findJsDependencyModules(component.jsPath, projectDir)),
    ...entries.sjsList.map(sjs => findJsDependencyModules(sjs.sjsPath, projectDir)),
    ...findJsDependencyModules(path.resolve(projectDir, 'app.js'), projectDir),
  ]);
  return {
    entries,
    entryDeps: lodash.uniqBy(result, dep => dep.importFilePath),
  };
}
