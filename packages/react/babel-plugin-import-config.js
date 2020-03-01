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
      useGlobalConfig: `${codeDir}/alipayH5/useGlobalConfig`,
      useGlobalDestroy: `${codeDir}/alipayH5/useGlobalDestroy`,
      useGlobalStorage: `${codeDir}/alipayH5/useGlobalStorage`,
      global: `${codeDir}/defaultGlobal`,
    }[name];
  },
};
