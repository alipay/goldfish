import useState from '../../src/hooks/useState';
import { createComponent } from '../utils';

it('should initialize state.', () => {
  const setData = jest.fn();
  const handler = createComponent(
    () => {
      const [v] = useState<any>();
      return {
        data: { v },
      };
    },
    { setData },
  );

  handler.mount();
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0][0]).toEqual({ v: undefined });
});

it('should rerun the `render` function after state changed.', done => {
  const setData = jest.fn();
  const handler = createComponent(
    () => {
      const [v, setV] = useState<any>();
      if (!v) {
        setTimeout(() => {
          setV(1);
        });
      }
      return {
        data: { v },
      };
    },
    {
      setData,
    },
  );

  handler.mount();
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0][0]).toEqual({ v: undefined });

  setTimeout(() => {
    expect(setData.mock.calls.length).toBe(2);
    expect(setData.mock.calls[1][0]).toEqual({ v: 1 });
    done();
  }, 4);
});

it('should initialize multiple states.', () => {
  const setData = jest.fn();
  const handler = createComponent(
    () => {
      const [v] = useState<any>();
      const [v1] = useState<any>();
      return {
        data: { v, v1 },
      };
    },
    {
      setData,
    },
  );

  handler.mount.call({
    setData,
  });
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0][0]).toEqual({ v: undefined, v1: undefined });
});

it('should batch the states changing.', done => {
  const setData = jest.fn();
  const handler = createComponent(
    () => {
      const [v, setV] = useState<any>();
      const [v1, setV1] = useState<any>();

      if (!v) {
        setTimeout(() => {
          setV(1);
          setV1(2);
        });
      }
      return {
        data: { v, v1 },
      };
    },
    {
      setData,
    },
  );

  handler.mount();
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0][0]).toEqual({ v: undefined, v1: undefined });

  setTimeout(() => {
    expect(setData.mock.calls.length).toBe(2);
    expect(setData.mock.calls[1][0]).toEqual({ v: 1, v1: 2 });
    done();
  }, 4);
});
