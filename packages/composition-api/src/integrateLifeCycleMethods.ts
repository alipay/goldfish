import PageSetup from './setup/PageSetup';
import ComponentSetup from './setup/ComponentSetup';
import AppSetup from './setup/AppSetup';

type Kind = 'page' | 'component' | 'app';

type LifeCycleMethodsType = {
  page: keyof tinyapp.IPageOptionsMethods;
  component: keyof tinyapp.IComponentLifeCycleMethods<any, any>;
  app: keyof tinyapp.IAppOptionsMethods;
};

type SetupType = {
  page: PageSetup;
  component: ComponentSetup;
  app: AppSetup;
};

type OptionsType = {
  page: tinyapp.PageOptions<any>;
  component: tinyapp.ComponentOptions<any>;
  app: tinyapp.AppOptions;
};

/**
 * Create a function to execute all registered lifecycle methods.
 *
 * @param lifeCycleMethods
 */
export default function integrateLifeCycleMethods<K extends Kind>(lifeCycleMethods: LifeCycleMethodsType[K][]) {
  return lifeCycleMethods.reduce<OptionsType[K]>((prev, cur: LifeCycleMethodsType[K]) => {
    (prev as any)[cur] = function(this: any, ...args: any[]) {
      const setup: SetupType[K] | undefined = this.$setup;
      if (!setup) {
        return;
      }

      const fns: Function[] = (setup.getMethod as any)(cur) || [];
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
