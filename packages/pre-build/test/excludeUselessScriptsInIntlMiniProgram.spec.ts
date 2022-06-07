import path from 'path';
import fs from 'fs-extra';
import excludeUselessScriptsInIntlMiniProgram from '../src/excludeUselessScriptsInIntlMiniProgram';
import createMiniProject from './utils/createMiniProject';

it('should pack the mini project.', () => {
  return createMiniProject(async ({ projectDir }) => {
    const { distDir } = await excludeUselessScriptsInIntlMiniProgram(projectDir);

    ['./components/button/button.js', './pages/index/index.js', './app.js'].forEach(relativePath => {
      const content = String(fs.readFileSync(path.resolve(distDir!, relativePath)));
      expect(/enter log/.test(content)).toBe(false);
      expect(/enter node_modules\/some-package log/.test(content)).toBe(false);
    });
  });
});
