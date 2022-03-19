/* eslint-disable @typescript-eslint/no-empty-function */
import useCallback from '../../src/hooks/useCallback';
import useState from '../../src/hooks/useState';
import createComponent from '../../src/connector/createComponent';
import createComponentInstance from '../common/createComponentInstance';

it('should cache the function.', done => {
  const fns: ((...args: any[]) => any)[] = [];
  const options = createComponent(() => {
    const [counter, setCounter] = useState(0);
    setTimeout(() => {
      if (counter < 3) {
        setCounter(counter + 1);
      }
    });

    fns.push(useCallback(() => {}, []));
    return {
      data: {},
    };
  });

  const componentInstance = createComponentInstance();
  componentInstance.data = options.data.call();
  options.didMount?.call(componentInstance);
  setTimeout(() => {
    expect(fns.length).toBe(4);
    expect(fns[0]).toBe(fns[1]);
    expect(fns[1]).toBe(fns[2]);
    expect(fns[2]).toBe(fns[3]);
    done();
  }, 100);
});

it('should not cache the function after deps being changed.', done => {
  const fns: ((...args: any[]) => any)[] = [];
  const options = createComponent(() => {
    const [counter, setCounter] = useState(0);
    setTimeout(() => {
      if (counter < 3) {
        setCounter(counter + 1);
      }
    });

    fns.push(useCallback(() => {}, [counter]));
    return {
      data: {},
    };
  });

  const componentInstance = createComponentInstance();
  componentInstance.data = options.data.call();
  options.didMount?.call(componentInstance);
  setTimeout(() => {
    expect(fns.length).toBe(4);
    expect(fns[0]).not.toBe(fns[1]);
    expect(fns[1]).not.toBe(fns[2]);
    expect(fns[2]).not.toBe(fns[3]);
    done();
  }, 100);
});
