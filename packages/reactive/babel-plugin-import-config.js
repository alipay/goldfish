const libraryName = require('./package.json').name;
const codeDir = `${libraryName}/lib`;

module.exports = {
  libraryName,
  camel2DashComponentName: false,
  customName(name) {
    return {
      observable: `${codeDir}/observable`,
      isObservable: `${codeDir}/isObservable`,
      autorun: `${codeDir}/autorun`,
      computed: `${codeDir}/computed`,
      watch: `${codeDir}/watch`,
      connect: `${codeDir}/connect`,
      reactive: `${codeDir}/reactive`,
      set: `${codeDir}/set`,
      raw: `${codeDir}/raw`,
      isRaw: `${codeDir}/isRaw`,
      unraw: `${codeDir}/unraw`,
      markObservable: `${codeDir}/markObservable`,
      watchDeep: `${codeDir}/watchDeep`,
      generateKeyPathString: `${codeDir}/generateKeyPathString`,
      call: `${codeDir}/call`,
      getCurrent: `${codeDir}/getCurrent`,
    }[name];
  },
};
