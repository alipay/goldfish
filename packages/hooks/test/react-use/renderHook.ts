import { ICreateFunction } from '../../src/connector/create';
import createComponent from '../../src/connector/createComponent';

export default function renderHook(fn: ICreateFunction<any>) {
  const options = createComponent<any>(fn);
  const result: any = {
    result: null,
  };
  options.didMount?.call({
    setData(r: any, cb: () => void) {
      result.result = r;
      cb();
    },
  });
  return result;
}
