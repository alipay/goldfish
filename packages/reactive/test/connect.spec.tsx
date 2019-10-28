import connect from '../src/connect';
import { render } from 'react-dom';
import * as React from 'react';
import observable from '../src/observable';
import computed from '../src/computed';

describe('connect', () => {
  it('should auto update the view after the observable changed.', async () => {
    class MyComponent extends React.Component<{}, { name: string; }> {
      state = {
        name: '',
      };

      render () {
        return (<div>{ this.state.name }</div>);
      }
    }

    const obj = { name: 'diandao' };
    observable(obj);
    connect(
      MyComponent.prototype,
      'componentDidMount',
      'componentWillUnmount',
      function (this: React.Component, data: Record<string, any>) {
        this.setState(data);
      },
      () => {
        return {
          getState: () => {
            return obj;
          },
          getComputed: () => {
            return {};
          },
        };
      },
      {
        shouldBatchUpdate: false,
      },
    );

    const div = document.createElement('div');
    render(<MyComponent />, div);
    await Promise.resolve();
    expect(div.innerHTML).toBe('<div>diandao</div>');

    obj.name = 'yibuyisheng';
    return Promise.resolve().then(() => {
      expect(div.innerHTML).toBe('<div>yibuyisheng</div>');
    });
  });

  it('should auto update the view after the computed changed.', async () => {
    class MyComponent extends React.Component<{}, { name: string; }> {
      state = {
        name: '',
      };

      render () {
        return (<div>{ this.state.name }</div>);
      }
    }

    const backObj = { name: 'diandao' };
    observable(backObj);
    const computedObj = {
      name: () => {
        return `${backObj.name}.zl`;
      },
    };
    computed(computedObj);

    connect(
      MyComponent.prototype,
      'componentDidMount',
      'componentWillUnmount',
      function (this: React.Component, data: Record<string, any>) {
        this.setState(data);
      },
      () => {
        return {
          getState() {
            return {};
          },
          getComputed() {
            return computedObj;
          },
        };
      },
      {
        shouldBatchUpdate: false,
      },
    );

    const div = document.createElement('div');
    render(<MyComponent />, div);
    await Promise.resolve();
    expect(div.innerHTML).toBe('<div>diandao.zl</div>');

    backObj.name = 'yibuyisheng';
    return new Promise(resolve => setTimeout(resolve)).then(() => {
      expect(div.innerHTML).toBe('<div>yibuyisheng.zl</div>');
    });
  });

  it('should convert the key.', () => {
    class MyComponent extends React.Component<{}, { realName: string; }> {
      state = {
        realName: '',
      };

      render () {
        return (<div>{ this.state.realName }</div>);
      }
    }

    const obj = { name: 'diandao' };
    observable(obj);

    connect(
      MyComponent.prototype,
      'componentDidMount',
      'componentWillUnmount',
      function (this: React.Component, data: Record<string, any>) {
        this.setState(data);
      },
      () => {
        return {
          getState() {
            return obj;
          },
          getComputed() {
            return {};
          },
        };
      },
      {
        keyMap: {
          name: 'realName',
        },
        shouldBatchUpdate: false,
      },
    );

    const div = document.createElement('div');
    render(<MyComponent />, div);
    return Promise.resolve().then(() => {
      expect(div.innerHTML).toBe('<div>diandao</div>');
      obj.name = 'yibuyisheng';
    }).then(() => {
      expect(div.innerHTML).toBe('<div>yibuyisheng</div>');
    });
  });

  it('should pass in the instance in `createStore`.', (done) => {
    const instance = {
      enter: () => {},
      leave: () => {},
    };
    connect(
      instance,
      'enter',
      'leave',
      () => {},
      (arg) => {
        expect(arg).toBe(instance);
        done();
        return {
          getState() {
            return {};
          },
          getComputed() {
            return {};
          },
        };
      },
    );
    instance.enter();
  });
});
