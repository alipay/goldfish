import * as React from 'react';
import * as ReactDOM from 'react-dom';
import observer from '../src/observer';
import useState from '../src/useState';
import { act } from 'react-dom/test-utils';

it('should detect the React context type.', () => {
  const component = observer(
    React,
    (data) => <div>{data.state.name}</div>,
    () => {
      const state = useState<{ name: string }>({
        name: 'yujiang',
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

  expect(container.innerHTML).toBe('<div>yujiang</div>');

  return new Promise((resolve) => {
    setTimeout(() => {
      expect(container.innerHTML).toBe('<div>diandao</div>');
      resolve();
    });
  });
});
