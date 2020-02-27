import * as React from 'react';
import * as ReactDOM from 'react-dom';
import observer from '../src/observer';
import usePluginsReady from '../src/usePluginsReady';
import { global } from '../src/Global';

it('should wait for all plugins ready.', () => {
  const result: any[] = [];
  const component = observer(
    () => <div></div>,
    () => {
      const pluginsReady = usePluginsReady();
      pluginsReady().then(() => {
        expect(global.isPluginsReady()).toBe(true);
        result.push(1);
      });
      result.push(2);
      global.init().then(
        () => {
          result.push(4);
        },
      );
      result.push(3);
      return {};
    },
  );

  const container = document.createElement('div');
  ReactDOM.render(React.createElement(component), container);

  return new Promise((resolve) => {
    setTimeout(() => {
      expect(result).toEqual([2, 3, 1, 4]);
      resolve();
    }, 10);
  });
});
