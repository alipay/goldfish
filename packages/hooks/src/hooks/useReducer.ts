import React from 'react';
import useState from './useState';
import useRef from './useRef';

export default function useReducer<R extends React.ReducerWithoutAction<any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => React.ReducerStateWithoutAction<R>,
): [React.ReducerStateWithoutAction<R>, React.DispatchWithoutAction];
export default function useReducer<R extends React.ReducerWithoutAction<any>>(
  reducer: R,
  initializerArg: React.ReducerStateWithoutAction<R>,
  initializer?: undefined,
): [React.ReducerStateWithoutAction<R>, React.DispatchWithoutAction];
export default function useReducer<R extends React.Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & React.ReducerState<R>,
  initializer: (arg: I & React.ReducerState<R>) => React.ReducerState<R>,
): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
export default function useReducer<R extends React.Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => React.ReducerState<R>,
): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
export default function useReducer<R extends React.Reducer<any, any>>(
  reducer: R,
  initialState: React.ReducerState<R>,
  initializer?: undefined,
): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
export default function useReducer(reducer: any, initialArg: any, init?: any): any {
  let initialState;
  if (init instanceof Function) {
    initialState = init(initialArg);
  } else {
    initialState = initialArg;
  }
  const [state, setState] = useState(initialState);
  const stateRef = useRef();
  stateRef.current = state;

  const dispatch = function (this: typeof stateRef, action: any) {
    const newState = reducer(this.current, action);
    setState(newState);
  }.bind(stateRef);

  return [state, dispatch];
}
