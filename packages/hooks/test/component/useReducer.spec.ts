import createComponentForMini from '../../src/connector/createComponent';
import useReducer from '../../src/hooks/useReducer';
import { createComponent } from '../utils';

it('should support the basic ability.', done => {
  const setData = jest.fn();
  const handler = createComponent(
    () => {
      const [state, dispatch] = useReducer(
        (state: { count: number }, action: { type: string }) => {
          if (action.type === 'increment') {
            return {
              count: state.count + 1,
            };
          }
          return state;
        },
        { count: 1 },
      );

      setTimeout(() => {
        dispatch({ type: 'increment' });
      }, 200);

      return {
        data: state,
      };
    },
    { setData },
  );

  handler.mount();
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0][0]).toEqual({ count: 1 });
  setTimeout(() => {
    expect(setData.mock.calls.length).toBe(2);
    expect(setData.mock.calls[1][0]).toEqual({ count: 2 });
    done();
  }, 201);
});

it('should initialize the state with the third function.', () => {
  const options = createComponentForMini(() => {
    const [state] = useReducer(
      (state: { count: number }) => {
        return state;
      },
      { count: 1 },
      initState => {
        return {
          count: initState.count + 1,
        };
      },
    );

    return {
      data: state,
    };
  });

  const setData = jest.fn();
  options.didMount?.call({
    setData,
  });
  expect(setData.mock.calls.length).toBe(1);
  expect(setData.mock.calls[0][0]).toEqual({ count: 2 });
});
