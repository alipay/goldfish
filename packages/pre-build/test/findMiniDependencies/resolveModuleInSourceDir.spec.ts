import * as path from 'path';
import resolveModuleInSourceDir from '../../src/findMiniDependencies/resolveModuleInSourceDir';
import createMiniProject from '../utils/createMiniProject';

it('should resolve the package module file under the node_modules.', () => {
  return createMiniProject(
    ({ projectDir }) => {
      const ret = resolveModuleInSourceDir(
        './props',
        path.resolve(projectDir, 'dist/node_modules/my-package'),
        path.resolve(projectDir, 'dist'),
      );
      expect(ret).toBe(path.resolve(projectDir, 'node_modules/my-package/props.js'));
    },
    { templateName: 'resolveModuleInSourceDir' },
  );
});
