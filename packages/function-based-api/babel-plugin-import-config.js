const libraryName = require('./package.json').name;
const codeDir = `${libraryName}/lib`;

module.exports = {
  libraryName,
  camel2DashComponentName: false,
  customName(name) {
    return {
      AppStore: `${codeDir}/AppStore`,
      attachLogic: `${codeDir}/attachLogic`,
      ComponentStore: `${codeDir}/ComponentStore`,
      createMiniApp: `${codeDir}/createMiniApp`,
      createMiniComponent: `${codeDir}/createMiniComponent`,
      createMiniPage: `${codeDir}/createMiniPage`,
      PageStore: `${codeDir}/PageStore`,
      Store: `${codeDir}/Store`,
      computed: `${codeDir}/decorators/computed`,
      observable: `${codeDir}/decorators/observable`,
      state: `${codeDir}/decorators/state`,
    }[name];
  },
};
