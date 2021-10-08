import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import observer from '../src/observer';
import useState from '../src/useState';
import useAutorun from '../src/useAutorun';

it('should use `autorun` to detect the changes.', () => {
  const result: any[] = [];
  const component = observer(
    React,
    data => <div>{data.state.name}</div>,
    () => {
      const state = useState<{ name: string }>({
        name: 'yujiang',
      });

      const autorun = useAutorun();
      autorun(() => {
        result.push(state.name);
      });
      setTimeout(() => {
        act(() => {
          state.name = 'diandao';
        });
      });
      return { state };
    },
  );

  const container = document.createElement('div');
  ReactDOM.render(React.createElement(component), container);

  return new Promise<void>(resolve => {
    setTimeout(() => {
      expect(result).toEqual(['yujiang', 'diandao']);
      resolve();
    }, 10);
  });
});
