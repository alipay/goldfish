import * as React from 'react';
import * as ReactDOM from 'react-dom';
import observer from '../src/observer';
import useState from '../src/useState';
import { act } from 'react-dom/test-utils';
import useWatch from '../src/useWatch';

it('should use `watch` to watch the changes.', () => {
  const result: any[] = [];
  const component = observer(
    React,
    (data) => <div>{data.state.name}</div>,
    () => {
      const state = useState<{ name: string }>({
        name: 'yujiang',
      });

      const watch = useWatch();
      watch(
        () => state.name,
        (newV) => {
          result.push(newV);
        },
        {
          immediate: true,
        },
      );
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

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      expect(result).toEqual(['yujiang', 'diandao']);
      resolve();
    }, 10);
  });
});
