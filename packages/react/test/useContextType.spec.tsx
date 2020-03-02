import * as React from 'react';
import * as ReactDOM from 'react-dom';
import observer from '../src/observer';
// import { observable } from '@goldfishjs/reactive';
// import { act } from 'react-dom/test-utils';
import useContextType from '../src/useContextType';

it('should detect the React context type.', () => {
  let contextType: any = undefined;
  const component = observer(
    React,
    () => <div></div>,
    () => {
      contextType = useContextType();
      return {};
    },
  );

  const container = document.createElement('div');
  ReactDOM.render(React.createElement(component), container);

  expect(contextType).toBe('react');
});
