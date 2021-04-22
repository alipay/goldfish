import createComponent from '../../src/component/create';
import useState from '../../src/component/useState';

it('should initialize state.', () => {
  const options = createComponent(() => {
    const [v] = useState<any>();
    return {
      data: { v },
    };
  });

  const setData = jest.fn();
  options.didMount?.call({
    setData,
  });
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0]).toEqual([{ v: undefined }]);
});

it('should rerun the `render` function after state changed.', done => {
  const options = createComponent(() => {
    const [v, setV] = useState<any>();
    if (!v) {
      setTimeout(() => {
        setV(1);
      });
    }
    return {
      data: { v },
    };
  });

  const setData = jest.fn();
  options.didMount?.call({
    setData,
  });
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0]).toEqual([{ v: undefined }]);

  setTimeout(() => {
    expect(setData.mock.calls.length).toBe(2);
    expect(setData.mock.calls[1]).toEqual([{ v: 1 }]);
    done();
  }, 4);
});

it('should initialize multiple states.', () => {
  const options = createComponent(() => {
    const [v] = useState<any>();
    const [v1] = useState<any>();
    return {
      data: { v, v1 },
    };
  });

  const setData = jest.fn();
  options.didMount?.call({
    setData,
  });
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0]).toEqual([{ v: undefined, v1: undefined }]);
});

it('should batch the states changing.', done => {
  const options = createComponent(() => {
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
  });

  const setData = jest.fn();
  options.didMount?.call({
    setData,
  });
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0]).toEqual([{ v: undefined, v1: undefined }]);

  setTimeout(() => {
    expect(setData.mock.calls.length).toBe(2);
    expect(setData.mock.calls[1]).toEqual([{ v: 1, v1: 2 }]);
    done();
  }, 4);
});
