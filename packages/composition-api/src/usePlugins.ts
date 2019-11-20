import { AppStore } from '@goldfishjs/core';
import checkSetupEnv from './checkSetupEnv';
import {
  Plugin,
  RoutePlugin,
  FeedbackPlugin,
  BridgePlugin,
  RequesterPlugin,
  PluginClass,
} from '@goldfishjs/plugins';
import getAppStore from './getAppStore';

export default function usePlugins(): {
  bridge: BridgePlugin;
  route: RoutePlugin;
  requester: RequesterPlugin;
  feedback: FeedbackPlugin;
};
export default function usePlugins<
  A extends PluginClass,
>(
  list: [A],
): Record<A['type'], InstanceType<A>>;
export default function usePlugins<
  A extends PluginClass,
  B extends PluginClass,
>(
  list: [A, B],
): Record<A['type'], InstanceType<A>> &
  Record<B['type'], InstanceType<B>>;
export default function usePlugins<
  A extends PluginClass,
  B extends PluginClass,
  C extends PluginClass,
>(
  list: [A, B, C],
): Record<A['type'], InstanceType<A>> &
  Record<B['type'], InstanceType<B>> &
  Record<C['type'], InstanceType<C>>;
export default function usePlugins<
  A extends PluginClass,
  B extends PluginClass,
  C extends PluginClass,
  D extends PluginClass,
>(
  list: [A, B, C, D],
): Record<A['type'], InstanceType<A>> &
  Record<B['type'], InstanceType<B>> &
  Record<C['type'], InstanceType<C>> &
  Record<D['type'], InstanceType<D>>;
export default function usePlugins<
  A extends PluginClass,
  B extends PluginClass,
  C extends PluginClass,
  D extends PluginClass,
  E extends PluginClass,
>(
  list: [A, B, C, D, E],
): Record<A['type'], InstanceType<A>> &
  Record<B['type'], InstanceType<B>> &
  Record<C['type'], InstanceType<C>> &
  Record<D['type'], InstanceType<D>> &
  Record<E['type'], InstanceType<E>>;
export default function usePlugins<
  A extends PluginClass,
  B extends PluginClass,
  C extends PluginClass,
  D extends PluginClass,
  E extends PluginClass,
  F extends PluginClass,
>(
  list: [A, B, C, D, E, F],
): Record<A['type'], InstanceType<A>> &
  Record<B['type'], InstanceType<B>> &
  Record<C['type'], InstanceType<C>> &
  Record<D['type'], InstanceType<D>> &
  Record<E['type'], InstanceType<E>> &
  Record<F['type'], InstanceType<F>>;
export default function usePlugins<
  A extends PluginClass,
  B extends PluginClass,
  C extends PluginClass,
  D extends PluginClass,
  E extends PluginClass,
  F extends PluginClass,
  G extends PluginClass,
>(
  list: [A, B, C, D, E, F, G],
): Record<A['type'], InstanceType<A>> &
  Record<B['type'], InstanceType<B>> &
  Record<C['type'], InstanceType<C>> &
  Record<D['type'], InstanceType<D>> &
  Record<E['type'], InstanceType<E>> &
  Record<F['type'], InstanceType<F>> &
  Record<G['type'], InstanceType<G>>;
export default function usePlugins<
  A extends PluginClass,
  B extends PluginClass,
  C extends PluginClass,
  D extends PluginClass,
  E extends PluginClass,
  F extends PluginClass,
  G extends PluginClass,
  H extends PluginClass,
>(
  list: [A, B, C, D, E, F, G, H],
): Record<A['type'], InstanceType<A>> &
  Record<B['type'], InstanceType<B>> &
  Record<C['type'], InstanceType<C>> &
  Record<D['type'], InstanceType<D>> &
  Record<E['type'], InstanceType<E>> &
  Record<F['type'], InstanceType<F>> &
  Record<G['type'], InstanceType<G>> &
  Record<H['type'], InstanceType<H>>;
export default function usePlugins(
  pluginClassList?: PluginClass[],
): Record<string, Plugin> {
  checkSetupEnv('usePlugins', ['page', 'app', 'component']);
  const appStore: AppStore = getAppStore();

  if (!pluginClassList) {
    return {
      get bridge() {
        return appStore.getPluginInstance(BridgePlugin);
      },
      get route() {
        return appStore.getPluginInstance(RoutePlugin);
      },
      get requester() {
        return appStore.getPluginInstance(RequesterPlugin);
      },
      get feedback() {
        return appStore.getPluginInstance(FeedbackPlugin);
      },
    };
  }

  return pluginClassList.reduce(
    (prev, pluginClass) => {
      Object.defineProperty(prev, pluginClass.type, {
        get: () => appStore.getPluginInstance(pluginClass),
      });
      return prev;
    },
    {} as Record<string, Plugin>,
  );
}
