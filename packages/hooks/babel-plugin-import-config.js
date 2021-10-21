const libraryName = require('./package.json').name;
const codeDir = `${libraryName}/lib`;

module.exports = {
  libraryName,
  camel2DashComponentName: false,
  customName(name) {
    return {
      createApp: `${codeDir}/connector/createApp`,
      createPage: `${codeDir}/connector/createPage`,
      createComponent: `${codeDir}/connector/createComponent`,
      useCallback: `${codeDir}/hooks/useCallback`,
      useContainerType: `${codeDir}/hooks/useContainerType`,
      useEffect: `${codeDir}/hooks/useEffect`,
      useMemo: `${codeDir}/hooks/useMemo`,
      useReducer: `${codeDir}/hooks/useReducer`,
      useRef: `${codeDir}/hooks/useRef`,
      useState: `${codeDir}/hooks/useState`,
      useAppEvent: `${codeDir}/hooks/useAppEvent`,
      usePageEvent: `${codeDir}/hooks/usePageEvent`,
      useGlobalData: `${codeDir}/hooks/useGlobalData`,
      usePageQuery: `${codeDir}/hooks/usePageQuery`,
    }[name];
  }
};
