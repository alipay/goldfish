import * as React from 'react';
import * as ReactDOM from 'react-dom';
import observer from '../src/observer';
import { observable } from '@goldfishjs/reactive';
import { act } from 'react-dom/test-utils';

it('should make the React component reactive.', () => {
  const obj = observable({
    name: 'a',
  });

  const component = observer(React, () => {
    return (<div>{obj.name}</div>);
  });

  const container = document.createElement('div');
  ReactDOM.render(React.createElement(component), container);

  expect(container.innerHTML).toBe('<div>a</div>');

  act(() => {
    obj.name = 'b';
  });

  expect(container.innerHTML).toBe('<div>b</div>');
});

it('should execute setup function once.', () => {
  const obj = observable({
    name: 'a',
  });

  let counter = 0;
  const component = observer(
    React,
    () => <div>{obj.name}</div>,
    () => {
      counter += 1;
      return {};
    },
  );

  obj.name = 'b';
  obj.name = 'c';

  const container = document.createElement('div');
  ReactDOM.render(React.createElement(component), container);

  expect(counter).toBe(1);
});

it('should pass the setup function result to the render function.', () => {
  const obj = observable({
    name: 'a',
  });

  const component = observer(
    React,
    (setupResult) => {
      return <div>{obj.name}-{setupResult.age}</div>;
    },
    () => {
      return { age: 1 };
    },
  );

  const container = document.createElement('div');
  ReactDOM.render(React.createElement(component), container);

  expect(container.innerHTML).toBe('<div>a-1</div>');
});
