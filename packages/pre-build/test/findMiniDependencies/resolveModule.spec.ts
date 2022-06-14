import path from 'path';
import resolveModule from '../../src/findMiniDependencies/resolveModule';
import createMiniProject from '../utils/createMiniProject';

it('should resolve the `events` module.', () => {
  return createMiniProject(
    ({ projectDir }) => {
      const m = resolveModule('events', { paths: [path.resolve(projectDir)] });
      expect(m).toBe(path.resolve(projectDir, 'node_modules/events/index.js'));
    },
    { templateName: 'resolveModule' },
  );
});
