const { exec } = require('../utils');
const path = require('path');

module.exports = {
  name: 'dev',
  description: 'Pre-compile the miniprogram source codes in develoment.',
  builder: () => {},
  async handler() {
    const gulpCommand = require.resolve('gulp/package.json')
      .replace('package.json', 'bin/gulp.js');

    const cwd = process.cwd();
    exec(`${gulpCommand} dev --gulpfile ${path.resolve(__dirname, '../src/gulpfile.js')} --cwd ${cwd}`, { cwd });
  },
};
