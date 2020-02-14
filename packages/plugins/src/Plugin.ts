import { watch } from '@goldfishjs/reactive';
import { observable, state } from '@goldfishjs/reactive-connect';

export type PluginClass<P extends Plugin = Plugin> = {
  new (): P;
  type: string;
};

export type GetPlugin = <R extends Plugin>(p: (PluginClass<R>) | string) => R;

@observable
export default abstract class Plugin {
  public static readonly type: string;

  @state
  public isInitCompleted = false;

  public async waitForReady() {
    return new Promise((resolve) => {
      const stop = watch(
        () => this.isInitCompleted,
        (v) => {
          if (v) {
            resolve();
            stop();
          }
        },
        {
          immediate: true,
        },
      );
    });
  }

  public abstract async init(getPlugin: GetPlugin): Promise<void>;
  public abstract destroy(): void;
}
