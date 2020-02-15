const libraryName = require('./package.json').name;
const codeDir = `${libraryName}/lib`;

function extendPackage(pkgName) {
  const importConfig = require(`${pkgName}/babel-plugin-import-config`);
  return importConfig.customName;
}

function extendPackages(pkgNameList, selfExportConfig) {
  const extendedPackageCustomNameFunctionList = pkgNameList.map(extendPackage);
  return (name) => {
    let result = selfExportConfig[name];
    if (result) {
      return result;
    }

    for (const customName of extendedPackageCustomNameFunctionList) {
      result = customName(name);
      if (result) {
        return result;
      }
    }
  };
}

module.exports = {
  libraryName,
  camel2DashComponentName: false,
  customName: extendPackages([
    '@goldfishjs/reactive-connect',
  ], {
    createApp: `${codeDir}/view/createApp`,
    createComponent: `${codeDir}/view/createComponent`,
    createPage: `${codeDir}/view/createPage`,
    AppStore: `${codeDir}/store/AppStore`,
    ComponentStore: `${codeDir}/store/ComponentStore`,
    PageStore: `${codeDir}/store/PageStore`,
  }),
};
