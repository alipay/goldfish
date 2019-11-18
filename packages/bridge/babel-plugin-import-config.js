const libraryName = require('./package.json').name;
const codeDir = `${libraryName}/lib`;

module.exports = {
  libraryName,
  camel2DashComponentName: false,
  customName(name) {
    return {
      bridge: `${codeDir}/bridge`,
      mockBridge: `${codeDir}/mock`
    }[name];
  },
};
