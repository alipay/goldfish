import useDefault from 'react-use/esm/useDefault';
import renderHook from './renderHook';

const setUp = (defaultValue: any, initialValue: any) =>
  renderHook(() => {
    const data = useDefault(defaultValue, initialValue);
    return {
      data,
    };
  });

function timeout() {
  return new Promise(resolve => {
    setTimeout(resolve);
  });
}

describe.each`
  valueType    | defaultValue | initialValue            | anotherValue
  ${'number'}  | ${0}         | ${5}                    | ${77}
  ${'object'}  | ${{}}        | ${{ name: 'John Doe' }} | ${{ name: 'Solid Snake' }}
  ${'boolean'} | ${false}     | ${false}                | ${true}
  ${'string'}  | ${''}        | ${'foo'}                | ${'bar'}
`('when value type is $valueType', ({ defaultValue, initialValue, anotherValue }) => {
  it('should init state with initial value', () => {
    const { result } = setUp(defaultValue, initialValue);
    const [value, setValue] = result;

    expect(value).toBe(initialValue);
    expect(setValue).toBeInstanceOf(Function);
  });

  it('should set state to another value', done => {
    const result = setUp(defaultValue, initialValue);
    const [, setValue] = result.result;

    setValue(anotherValue);

    setTimeout(() => {
      expect(result.result[0]).toBe(anotherValue);
      done();
    });
  });

  it('should return default value if state set to null', done => {
    const result = setUp(defaultValue, initialValue);
    const [, setValue] = result.result;

    setValue(null);

    setTimeout(() => {
      expect(result.result[0]).toBe(defaultValue);
      done();
    });
  });

  it('should return default value if state set to undefined', done => {
    const result = setUp(defaultValue, initialValue);
    const [, setValue] = result.result;

    setValue(undefined);

    setTimeout(() => {
      expect(result.result[0]).toBe(defaultValue);
      done();
    });
  });

  it('should handle state properly after being set to nil and then to another value', async () => {
    const result = setUp(defaultValue, initialValue);
    const [, setValue] = result.result;

    setValue(undefined);
    await timeout();
    expect(result.result[0]).toBe(defaultValue);

    setValue(null);
    await timeout();
    expect(result.result[0]).toBe(defaultValue);

    setValue(anotherValue);
    await timeout();
    expect(result.result[0]).toBe(anotherValue);
  });
});
