import { watch } from '@goldfishjs/reactive';
import observable from '../../src/decorators/observable';
import computed from '../../src/decorators/computed';
import state from '../../src/decorators/state';

it('should trigger the watcher.', () => {
  return new Promise<void>(resolve => {
    @observable
    class MyStore {
      @state
      location: Record<string, any> = {};

      @computed
      get addressInfo() {
        return `${this.location.city}.ha`;
      }
    }

    const store = new MyStore();
    const stop = watch(
      () => store.addressInfo,
      addressInfo => {
        expect(addressInfo).toBe('cd.ha');
        stop();
        resolve();
      },
    );
    store.location = { city: 'cd' };
  });
});
