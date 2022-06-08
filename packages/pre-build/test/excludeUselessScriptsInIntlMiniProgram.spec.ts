import glob from 'glob';
import excludeUselessScriptsInIntlMiniProgram from '../src/excludeUselessScriptsInIntlMiniProgram';
import createMiniProject from './utils/createMiniProject';

it('should pack the mini project.', () => {
  return createMiniProject(({ projectDir }) => {
    excludeUselessScriptsInIntlMiniProgram(projectDir);
    expect(glob.sync(`${projectDir}/**/*`, { nodir: true }).map(f => f.replace(projectDir, ''))).toMatchSnapshot();
  });
});
