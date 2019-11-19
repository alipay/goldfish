#!/usr/bin/env node

const { exec } = require('../src/utils');
const path = require('path');

const gulpCommand = require.resolve('gulp/package.json')
  .replace('package.json', 'bin/gulp.js');

const cwd = process.cwd();
exec(`${gulpCommand} dev --gulpfile ${path.resolve(__dirname, '../src/gulpfile.js')} --cwd ${cwd}`, { cwd });
