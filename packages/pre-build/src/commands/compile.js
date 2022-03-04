const { exec } = require('../utils');
const path = require('path');

module.exports = {
  name: 'compile',
  description: 'Pre-compile the miniprogram source codes.',
  builder: () => {},
  async handler() {
    const gulpCommand = require.resolve('gulp/package.json')
      .replace('package.json', 'bin/gulp.js');

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    exec(`node ${gulpCommand} all --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd });
  },
};
