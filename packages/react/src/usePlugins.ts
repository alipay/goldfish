import {
  Plugin,
  RoutePlugin,
  FeedbackPlugin,
  BridgePlugin,
  RequesterPlugin,
  PluginClass,
} from '@goldfishjs/plugins';
import { usePlugins as baseUsePlugins } from '@goldfishjs/composition-api';
import useContextType from './useContextType';
import { global } from './Global';

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
export default function usePlugins(list: PluginClass<Plugin>[]): Record<string, Plugin>;
export default function usePlugins(
  pluginClassList?: PluginClass[],
): Record<string, Plugin> {
  const type = useContextType();
  if (type === 'react') {
    if (!pluginClassList) {
      return {
        get bridge() {
          return global.get(BridgePlugin);
        },
        get route() {
          return global.get(RoutePlugin);
        },
        get requester() {
          return global.get(RequesterPlugin);
        },
        get feedback() {
          return global.get(FeedbackPlugin);
        },
      };
    }

    return pluginClassList.reduce(
      (prev, pluginClass) => {
        Object.defineProperty(prev, pluginClass.type, {
          get: () => global.get(pluginClass),
        });
        return prev;
      },
      {} as Record<string, Plugin>,
    );
  }

  return pluginClassList ? baseUsePlugins(pluginClassList) : baseUsePlugins();
}
