import * as path from 'path';
import { EventEmitter } from 'events';
import * as chokidar from 'chokidar';
import * as lodash from 'lodash';
import findJsDependencyModules, { Dependency } from './findJsDependencyModules';
import findPages from './findPages';
import findComponents from './findComponents';
import findSjs from './findSjs';
import { warn } from '../utils';

export type ChangeOptions = {
  deps: Dependency[];
  components?: ReturnType<typeof findComponents>;
  pages?: ReturnType<typeof findPages>;
  sjsList?: ReturnType<typeof findSjs>;
  changedFile: string;
};

export default class EntriesWatcher {
  private projectDir: string;
  private event = new EventEmitter();

  constructor(projectDir: string) {
    this.projectDir = projectDir;
    this.startWatch();
  }

  onChange(cb: (options: ChangeOptions) => void) {
    return this.event.on('deps', cb);
  }

  private startWatch() {
    const watcher = chokidar.watch([`${this.projectDir}/**/*.(js|json|axml)`], {
      ignoreInitial: true,
      ignored: [/node_modules/],
      followSymlinks: false,
    });

    const handler = (filePath: string) => {
      try {
        if (filePath.endsWith('.js')) {
          this.event.emit('deps', { changedFile: filePath, deps: findJsDependencyModules(filePath, this.projectDir) });
        } else if (filePath === path.resolve(this.projectDir, 'app.json')) {
          const pages = findPages(this.projectDir);
          this.event.emit('deps', {
            pages,
            changedFile: filePath,
            deps: lodash.uniqBy(
              lodash.flatten(pages.map(page => findJsDependencyModules(page.jsPath, this.projectDir))),
              dep => dep.importFilePath,
            ),
          });
        } else if (filePath.endsWith('.json')) {
          const components = findComponents(filePath, this.projectDir);
          this.event.emit('deps', {
            components,
            changedFile: filePath,
            deps: lodash.uniqBy(
              lodash.flatten(components.map(component => findJsDependencyModules(component.jsPath, this.projectDir))),
              dep => dep.importFilePath,
            ),
            // Handle the sjs files under the node_modules.
            sjsList: lodash.uniqBy(
              lodash.flatten(components.map(component => findSjs(component.axmlPath))),
              sjs => sjs.sjsPath,
            ),
          });
        } else if (filePath.endsWith('.axml')) {
          const sjsList = findSjs(filePath);
          this.event.emit('deps', {
            sjsList,
            changedFile: filePath,
            deps: lodash.uniqBy(
              lodash.flatten(sjsList.map(sjs => findJsDependencyModules(sjs.sjsPath, this.projectDir))),
              dep => dep.importFilePath,
            ),
          });
        }
      } catch (e) {
        warn(e);
      }
    };
    watcher.on('add', handler);
    watcher.on('change', handler);

    process.on('SIGINT', () => {
      watcher.close();
    });
  }
}
