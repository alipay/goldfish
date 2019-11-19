const libraryName = require('./package.json').name;
const codeDir = `${libraryName}/lib`;

module.exports = {
  libraryName,
  camel2DashComponentName: false,
  customName(name) {
    return {
      route: `${codeDir}/exportRouteInstance`,
    }[name];
  },
};
