import createComponentForMini from '../../src/connector/createComponent';
import useReducer from '../../src/hooks/useReducer';
import createComponentInstance from '../common/createComponentInstance';
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
  const componentInstance = handler.getComponentInstance();
  expect(componentInstance.data.count).toBe(1);
  expect(setData.mock.calls.length).toBe(0);
  setTimeout(() => {
    expect(setData.mock.calls.length).toBe(1);
    expect(setData.mock.calls[0][0]).toEqual({ count: 2 });
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
  const componentInstance = createComponentInstance({ setData });
  componentInstance.data = options.data.call();
  options.didMount?.call(componentInstance);
  expect(componentInstance.data.count).toBe(2);
  expect(setData.mock.calls.length).toBe(0);
});
