/* eslint-disable @typescript-eslint/no-empty-function */
import useMemo from '../../src/hooks/useMemo';
import useState from '../../src/hooks/useState';
import createComponent from '../../src/connector/createComponent';
import createComponentInstance from '../common/createComponentInstance';

it('should cache the value.', done => {
  let v: any;
  const options = createComponent(() => {
    const [counter, setCounter] = useState(0);
    setTimeout(() => {
      if (counter < 3) {
        setCounter(counter + 1);
      }
    });

    v = useMemo(() => counter, []);

    return {
      data: {},
    };
  });

  const componentInstance = createComponentInstance();
  componentInstance.data = options.data.call();
  options.didMount?.call(componentInstance);
  setTimeout(() => {
    expect(v).toBe(0);
    done();
  }, 100);
});
