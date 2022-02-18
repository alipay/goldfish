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
    options.didMount?.call({
      $batchedUpdates() {},
    });
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
    options.didMount?.call(componentInstance);

    componentInstance.props = {
      list: ['a'],
    };
    options.didUpdate?.call(componentInstance, {}, {});
  });
});
