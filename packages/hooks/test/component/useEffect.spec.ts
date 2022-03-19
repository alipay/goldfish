/* eslint-disable @typescript-eslint/no-empty-function */
import useEffect from '../../src/hooks/useEffect';
import useState from '../../src/hooks/useState';
import createComponentForMini from '../../src/connector/createComponent';
import { createComponent } from '../utils';
import createComponentInstance from '../common/createComponentInstance';

it('should run the effect function after mount.', done => {
  const fn = jest.fn();
  const options = createComponentForMini(() => {
    useEffect(fn);
    return {
      data: {},
    };
  });

  const componentInstance = createComponentInstance();
  componentInstance.data = options.data.call();
  options.didMount?.call(componentInstance);
  expect(fn.mock.calls.length).toBe(1);
  done();
});

it('should run the multiple effect functions after mount.', done => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const options = createComponentForMini(() => {
    useEffect(fn1);
    useEffect(fn2);
    return {
      data: {},
    };
  });

  const componentInstance = createComponentInstance();
  componentInstance.data = options.data.call();
  options.didMount?.call(componentInstance);
  expect(fn1.mock.calls.length).toBe(1);
  expect(fn2.mock.calls.length).toBe(1);
  done();
});

it('should call the clear function after the next mount.', done => {
  const fn = jest.fn();
  const options = createComponentForMini(() => {
    const [flag, setFlag] = useState(true);
    useEffect(() => {
      if (flag) {
        setFlag(false);
      }
      return fn;
    }, []);
    return {
      data: {},
    };
  });

  const componentInstance = createComponentInstance({
    setData: (_: any, cb: () => void) => cb(),
  });
  componentInstance.data = options.data.call();
  options.didMount?.call(componentInstance);
  options.didUnmount?.call(componentInstance);
  setTimeout(() => {
    expect(fn.mock.calls.length).toBe(1);
    done();
  });
});

it('should rerun the effect after the dependencies being changed.', done => {
  const fn = jest.fn();
  const handler = createComponent(
    () => {
      const [v, setV] = useState(true);
      useEffect(() => {
        fn(v);
      }, [v]);

      setTimeout(() => {
        setV(false);
      });

      return {
        data: {},
      };
    },
    {
      setData: (_: any, cb?: () => void) => cb && cb(),
    },
  );

  handler.mount();
  expect(fn.mock.calls.length).toBe(1);
  setTimeout(() => {
    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls).toMatchObject([[true], [false]]);
    done();
  }, 10);
});

it('should not rerun the effect while the dependencies not being changed.', done => {
  const fn = jest.fn();
  const options = createComponentForMini(() => {
    const [v, setV] = useState(true);
    useEffect(() => {
      fn(v);
    }, [v]);

    setTimeout(() => {
      setV(true);
    });

    return {
      data: {},
    };
  });

  const componentInstance = createComponentInstance();
  componentInstance.data = options.data.call();
  options.didMount?.call(componentInstance);
  expect(fn.mock.calls.length).toBe(1);
  setTimeout(() => {
    options.didUpdate?.call(componentInstance, {}, {});
    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls).toEqual([[true]]);
    done();
  }, 10);
});
