const libraryName = require('./package.json').name;
const codeDir = `${libraryName}/lib`;

module.exports = {
  libraryName,
  camel2DashComponentName: false,
  customName(name) {
    return {
      observer: `${codeDir}/observer`,
      useAutorun: `${codeDir}/useAutorun`,
      useWatch: `${codeDir}/useWatch`,
      useContextType: `${codeDir}/useContextType`,
      useProps: `${codeDir}/useProps`,
      useState: `${codeDir}/useState`,
    }[name];
  },
};
