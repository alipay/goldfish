import isObservable from '@goldfishjs/reactive/lib/isObservable';
import setupComponent from '../src/setupComponent';
import useProps from '../src/useProps';
import useWatch from '../src/useWatch';
import useState from '../src/useState';

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

it('should listen to the getter.', () => {
  return new Promise<void>(resolve => {
    const options = setupComponent(() => {
      const state = useState({
        name: 'zhangsan',
      });

      setTimeout(() => {
        state.name = 'lisi';
        setTimeout(() => {
          expect(componentInstance.data.name).toBe('lisi');
          resolve();
        });
      });

      return {
        get name() {
          return state.name;
        },
      };
    });

    const componentInstance: any = {
      $batchedUpdates(cb: Function) {
        return cb();
      },
      setData(obj: Record<string, any>) {
        componentInstance.data = {
          ...componentInstance.data,
          ...obj,
        };
      },
    };
    componentInstance.data = (options.data as any).call();
    options.didMount?.call(componentInstance);
  });
});

it('should listen to the getter from the props.', () => {
  return new Promise<void>(resolve => {
    const options = setupComponent(
      {
        name: 'zhangsan',
      },
      () => {
        const props = useProps<{ name: string }>();
        return {
          get name() {
            return props.name;
          },
        };
      },
    );

    const componentInstance: any = {
      $batchedUpdates(cb: Function) {
        return cb();
      },
      setData(obj: Record<string, any>) {
        componentInstance.data = {
          ...componentInstance.data,
          ...obj,
        };
      },
    };
    componentInstance.data = (options.data as any).call();
    options.didMount?.call(componentInstance);

    componentInstance.props = {
      name: 'lisi',
    };
    options.didUpdate?.call(componentInstance, {}, {});

    setTimeout(() => {
      expect(componentInstance.data.name).toBe('lisi');
      resolve();
    });
  });
});

it('should sync the props before init.', () => {
  return new Promise<void>(resolve => {
    const options = setupComponent(
      {
        name: 'zhangsan',
      },
      () => {
        const props = useProps<{ name: string }>();
        return {
          get name() {
            return props.name;
          },
        };
      },
    );

    const componentInstance: any = {
      $batchedUpdates(cb: Function) {
        return cb();
      },
      setData(obj: Record<string, any>) {
        componentInstance.data = {
          ...componentInstance.data,
          ...obj,
        };
      },
    };
    componentInstance.data = (options.data as any).call();
    componentInstance.props = {
      name: 'lisi',
    };
    options.didMount?.call(componentInstance);

    setTimeout(() => {
      expect(componentInstance.data.name).toBe('lisi');
      resolve();
    });
  });
});
