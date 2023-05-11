const { exec, getBinCommand, execCallback } = require('../utils');
const path = require('path');

module.exports = {
  name: 'npm-dev',
  description: 'Compile the source codes in npm development watch mode.',
  builder: y => {
    y.option('on-success', {
      describe: 'The callback after every changed file successfully handled.',
      type: 'string',
    });
  },
  async handler(args) {
    const onSuccess = args.onSuccess;
    const gulpCommand = getBinCommand('gulp', 'gulp', [__dirname]);

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    const env = {
      OUT_DIR: './lib',
      BASE_DIR: './src',
      ...process.env,
      ON_SUCCESS_CALLBACK: onSuccess,
    };
    await exec(`${gulpCommand} npm --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd, env });
    await execCallback(undefined, onSuccess);
    exec(`${gulpCommand} npm-dev --gulpfile ${gulpFilePath} --cwd ${cwd}`, {
      cwd,
      env,
    });
  },
};
