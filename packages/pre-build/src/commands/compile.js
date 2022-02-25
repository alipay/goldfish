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
    exec(`${gulpCommand} all --gulpfile ${path.resolve(__dirname, '../gulpfile.js')} --cwd ${cwd}`, { cwd });
  },
};
