const path = require('path');
const fs = require('fs-extra');
const utils = require('./scripts/utils');

const projects = utils.lerna
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
