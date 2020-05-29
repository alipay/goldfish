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
      useBridge: `${codeDir}/alipayH5/useBridge`,
      useFeedback: `${codeDir}/alipayH5/useFeedback`,
      useRequester: `${codeDir}/alipayH5/useRequester`,
      useGlobalConfig: `${codeDir}/useGlobalConfig`,
      useGlobalDestroy: `${codeDir}/useGlobalDestroy`,
      useGlobalStorage: `${codeDir}/useGlobalStorage`,
      useSetup: `${codeDir}/useSetup`,
      useMount: `${codeDir}/useMount`,
      useUnmount: `${codeDir}/useUnmount`,
      useRef: `${codeDir}/useRef`,
      global: `${codeDir}/defaultGlobal`
    }[name];
  }
};
