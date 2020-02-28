#!/usr/bin/env node

const { exec } = require('../src/utils');
const path = require('path');

const gulpCommand = require.resolve('gulp/package.json')
  .replace('package.json', 'bin/gulp.js');

const cwd = process.cwd();
exec(`${gulpCommand} npm --gulpfile ${path.resolve(__dirname, '../src/gulpfile.js')} --cwd ${cwd}`, {
  cwd,
  env: {
    OUT_DIR: './lib',
    BASE_DIR: './src',
    ...process.env,
  },
});
