import PageSetup from './setup/PageSetup';

export default function integratePageEventMethods(pageMethods: (keyof tinyapp.IPageEvents)[]): tinyapp.IPageEvents {
  return pageMethods.reduce((prev, cur: keyof tinyapp.IPageEvents) => {
    (prev as any)[cur] = function (this: any, ...args: any[]) {
      const setup: PageSetup | undefined = this.$setup;
      if (!setup) {
        return;
      }

      const fns: Function[] = (setup.getMethod as any)(`events.${cur}`) || [];
      let result: any;
      for (const i in fns) {
        const fn = fns[i];
        result = (fn as Function).call(this, ...args);
      }
      return result;
    };
    return prev;
  }, {});
}
