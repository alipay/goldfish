import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useSetup, useState } from '../src';
import Loading from './scenes/Loading';

let container: HTMLDivElement | null = null;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  container && document.body.removeChild(container);
  container = null;
});

it('should connect the data.', async () => {
  function MyComponent() {
    const { connect } = useSetup(React, () => {
      const state = useState({
        counter: 1,
      });
      return {
        state,
        onClick() {
          state.counter += 1;

          setTimeout(() => {
            state.counter += 1;
          });
        },
      };
    });
    return connect(d => {
      return <div onClick={d.onClick}>{d.state.counter}</div>;
    });
  }

  act(() => {
    ReactDOM.render(<MyComponent />, container);
  });

  expect(container && container.innerHTML).toBe('<div>1</div>');

  container?.children[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise(resolve => setTimeout(resolve));
  expect(container && container.innerHTML).toBe('<div>3</div>');
});

it('should render the changed data.', async () => {
  act(() => {
    ReactDOM.render(<Loading />, container);
  });

  expect(container && container.innerHTML).toBe('');

  await new Promise(resolve => setTimeout(resolve, 201));
  expect(container && container.innerHTML).toBe('<div>asdf</div>');

  await new Promise(resolve => setTimeout(resolve, 201));
  expect(container && container.innerHTML).toBe('<div><div>1</div><div>2</div><div>3</div></div>');
});
