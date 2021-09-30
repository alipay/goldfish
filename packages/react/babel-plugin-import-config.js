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
      useFetchInitData: `${codeDir}/useFetchInitData`,
      useGlobalData: `${codeDir}/useGlobalData`,
      useGlobalFetchInitData: `${codeDir}/useGlobalFetchInitData`,
      useGlobalConfig: `${codeDir}/useGlobalConfig`,
      useGlobalDestroy: `${codeDir}/useGlobalDestroy`,
      useGlobalStorage: `${codeDir}/useGlobalStorage`,
      useSetup: `${codeDir}/useSetup`,
      useMount: `${codeDir}/useMount`,
      useUnmount: `${codeDir}/useUnmount`,
      useRef: `${codeDir}/useRef`,
      app: `${codeDir}/defaultApp`,
      App: `${codeDir}/App`,
      useReactiveData: `${codeDir}/useReactiveData`,
      useFeedback: `${codeDir}/useFeedback`,
      usePageQuery: `${codeDir}/usePageQuery`,
    }[name];
  }
};
