const libraryName = require('./package.json').name;
const codeDir = `${libraryName}/lib`;

module.exports = {
  libraryName,
  camel2DashComponentName: false,
  customName(name) {
    return {
      useComponentLifeCycle: `${codeDir}/useComponentLifeCycle`,
      useComputed: `${codeDir}/useComputed`,
      usePageLifeCycle: `${codeDir}/usePageLifeCycle`,
      useAppLifeCycle: `${codeDir}/useAppLifeCycle`,
      setupComponent: `${codeDir}/setupComponent`,
      setupPage: `${codeDir}/setupPage`,
      setupApp: `${codeDir}/setupApp`,
      useState: `${codeDir}/useState`,
      useValue: `${codeDir}/useValue`,
      useFetchInitData: `${codeDir}/useFetchInitData`,
      useProps: `${codeDir}/useProps`,
      useContextType: `${codeDir}/useContextType`,
      usePlugin: `${codeDir}/usePlugin`,
      useReady: `${codeDir}/useReady`,
      useInitDataReady: `${codeDir}/useInitDataReady`,
      usePluginReady: `${codeDir}/usePluginReady`,
    }[name];
  },
};
