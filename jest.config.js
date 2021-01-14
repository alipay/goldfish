const path = require('path');
const fs = require('fs-extra');
const utils = require('./scripts/utils');

const targetPackage = process.env.TARGET_PACKAGE;

const projects = targetPackage
  ? [`<rootDir>/packages/${targetPackage}`]
  : utils.lerna
      .list()
      .filter(pkg => {
        const testDir = path.resolve(pkg.location, 'test');
        return fs.pathExistsSync(testDir) && fs.readdirSync(testDir).length;
      })
      .map(pkg => pkg.location);

module.exports = {
  projects,
  testEnvironment: './CustomTestEnvironment.js',
};
