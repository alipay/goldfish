const { exec, getBinCommand } = require('../utils');
const path = require('path');

module.exports = {
  name: 'npm-dev',
  description: 'Compile the source codes in npm development watch mode.',
  builder: () => {},
  async handler() {
    const gulpCommand = getBinCommand('gulp', 'gulp', [__dirname]);

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    exec(`${gulpCommand} npm-dev --gulpfile ${gulpFilePath} --cwd ${cwd}`, {
      cwd,
      env: {
        OUT_DIR: './lib',
        BASE_DIR: './src',
        ...process.env,
      },
    });
  },
};
