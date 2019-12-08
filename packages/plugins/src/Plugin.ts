export type PluginClass<P extends Plugin = Plugin> = {
  new (): P;
  type: string;
};

export type GetPlugin = <R extends Plugin>(p: (PluginClass<R>) | string) => R;

export default abstract class Plugin {
  public static readonly type: string;

  public abstract async init(getPlugin: GetPlugin): Promise<void>;
  public abstract destroy(): void;
}
