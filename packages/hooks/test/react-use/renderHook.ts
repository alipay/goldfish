import { ICreateFunction } from '../../src/connector/create';
import createComponent from '../../src/connector/createComponent';

export default function renderHook(fn: ICreateFunction<any>) {
  const options = createComponent<any>(fn);
  const result: any = {
    result: {
      current: null,
    },
  };
  options.didMount?.call({
    setData(r: any, cb: () => void) {
      result.result.current = r;
      cb();
    },
  });
  return result;
}
