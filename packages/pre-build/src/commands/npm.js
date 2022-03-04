const { exec } = require('../utils');
const path = require('path');

module.exports = {
  name: 'npm',
  description: 'Compile the source codes in npm development.',
  builder: () => {},
  async handler() {
    const gulpCommand = require.resolve('gulp/package.json')
      .replace('package.json', 'bin/gulp.js');

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    exec(`node ${gulpCommand} npm --gulpfile ${gulpFilePath} --cwd ${cwd}`, {
      cwd,
      env: {
        OUT_DIR: './lib',
        BASE_DIR: './src',
        ...process.env,
      },
    });
  },
};
