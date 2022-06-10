import glob from 'glob';
import excludeUselessScriptsInIntlMiniProgram, {
  findRelativePath,
} from '../src/excludeUselessScriptsInIntlMiniProgram';
import createMiniProject from './utils/createMiniProject';

it('should pack the mini project.', () => {
  return createMiniProject(({ projectDir }) => {
    excludeUselessScriptsInIntlMiniProgram(projectDir);
    expect(glob.sync(`${projectDir}/**/*`, { nodir: true }).map(f => f.replace(projectDir, ''))).toMatchSnapshot();
  });
});

it('should find the relative path.', () => {
  const p = findRelativePath(
    '/a/b/projects/c/packages/d/lib',
    '/a/b/projects/c/node_modules/@babel/runtime/helpers/defineProperty.js',
  );
  expect(p).toBe('node_modules/@babel/runtime/helpers/defineProperty.js');
});
