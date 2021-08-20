import * as React from 'react';
import * as ReactDOM from 'react-dom';
import observer from '../src/observer';
import useFetchInitData from '../src/useFetchInitData';

it('should add fetching init data logic.', () => {
  const result: any[] = [];
  const component = observer(
    React,
    () => <div></div>,
    () => {
      useFetchInitData(
        () => {
          return new Promise((resolve) => {
            setTimeout(
              () => {
                result.push(1);
                resolve();
              },
            );
          });
        },
      );
      return {};
    },
  );

  const container = document.createElement('div');
  ReactDOM.render(React.createElement(component), container);

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      expect(result).toEqual([1]);
      resolve();
    }, 100);
  });
});
