import * as lodash from 'lodash';
import findComponents from './findComponents';
import findPages from './findPages';
import findSjs from './findSjs';

export default function findEntries(projectDir: string) {
  const pages = findPages(projectDir);
  const components = lodash.uniqBy(
    lodash.flatten(
      pages.map(page => {
        const components = page.jsonPath ? findComponents(page.jsonPath, projectDir) : [];
        return components;
      }),
    ),
    component => component.jsPath,
  );
  const sjsList = lodash.uniqBy(
    lodash.flatten(
      [...components, ...pages].map(v => {
        const sjsList = v.axmlPath ? findSjs(v.axmlPath) : [];
        return sjsList;
      }),
    ),
    sjs => sjs.sjsPath,
  );
  return {
    pages,
    components,
    sjsList,
  };
}
