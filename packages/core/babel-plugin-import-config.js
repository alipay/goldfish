const libraryName = require('./package.json').name;
const codeDir = `${libraryName}/lib`;

module.exports = {
  libraryName,
  camel2DashComponentName: false,
  customName(name) {
    return {
      createApp: `${codeDir}/view/createApp`,
      createComponent: `${codeDir}/view/createComponent`,
      createPage: `${codeDir}/view/createPage`,
      AppStore: `${codeDir}/store/AppStore`,
      ComponentStore: `${codeDir}/store/ComponentStore`,
      PageStore: `${codeDir}/store/PageStore`,
    }[name];
  },
};
