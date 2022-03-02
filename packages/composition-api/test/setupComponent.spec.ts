import isObservable from '@goldfishjs/reactive/lib/isObservable';
import setupComponent from '../src/setupComponent';
import useProps from '../src/useProps';
import useWatch from '../src/useWatch';

it('should convert the default props to an reactive object.', () => {
  return new Promise<void>(resolve => {
    const options = setupComponent(
      {
        list: [],
      },
      () => {
        const props = useProps<{ list: any[] }>();
        expect(isObservable(props)).toBe(true);
        resolve();
        return {};
      },
    );
    const instance: any = {
      $batchedUpdates() {},
    };
    instance.data = (options.data as any).call();
    options.didMount?.call(instance);
  });
});

it('should handle the props change.', () => {
  return new Promise<void>(resolve => {
    const options = setupComponent(
      {
        list: [],
      },
      () => {
        const props = useProps<{ list: any[] }>();
        const watch = useWatch();

        watch(
          () => props.list,
          newVal => {
            expect(newVal).toEqual(['a']);
            resolve();
          },
        );

        return {};
      },
    );

    const componentInstance: any = {
      $batchedUpdates() {},
    };
    componentInstance.data = (options.data as any).call();
    options.didMount?.call(componentInstance);

    componentInstance.props = {
      list: ['a'],
    };
    options.didUpdate?.call(componentInstance, {}, {});
  });
});
