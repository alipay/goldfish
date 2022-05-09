import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import observer from '../src/observer';
import useProps from '../src/useProps';
import useState from '../src/useState';

it('should receive the props.', () => {
  interface IC1Props {
    name: string;
  }

  interface IData {
    props: IC1Props;
  }

  const c1 = observer<IC1Props, IData>(
    React,
    {
      name: '',
    },
    data => <div>{JSON.stringify(data.props)}</div>,
    () => {
      const props = useProps<IC1Props>();
      return {
        props,
      };
    },
  );

  const c2 = observer(React, () => React.createElement(c1, { name: 'yujiang' }));

  const container = document.createElement('div');
  ReactDOM.render(React.createElement(c2), container);

  expect(container.innerHTML).toBe('<div>{"name":"yujiang"}</div>');
});

it('should detect the props change.', () => {
  interface IC1Props {
    name: string;
  }

  interface IData {
    props: IC1Props;
  }

  const c1 = observer<IC1Props, IData>(
    React,
    {
      name: '',
    },
    data => <div>{JSON.stringify(data.props)}</div>,
    () => {
      const props = useProps<IC1Props>();
      return {
        props,
      };
    },
  );

  const c2 = observer(
    React,
    data => React.createElement(c1, { name: data.state.name }),
    () => {
      const state = useState({
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
  ReactDOM.render(React.createElement(c2), container);

  return new Promise<void>(resolve => {
    expect(container.innerHTML).toBe('<div>{"name":"yujiang"}</div>');
    setTimeout(() => {
      expect(container.innerHTML).toBe('<div>{"name":"diandao"}</div>');
      resolve();
    });
  });
});
