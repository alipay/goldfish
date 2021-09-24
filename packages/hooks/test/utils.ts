import View from '../src/common/View';
import { CreateFunction } from '../src/connector/create';
import createComponentForMini from '../src/connector/createComponent';

export function createDefaultInstance() {
  return {
    setData: jest.fn(),
    $batchedUpdates: (fn: () => void) => {
      return fn();
    },
    $viewId: `${Math.random()}-${Date.now()}`,
    $spliceData: jest.fn(),
  };
}

export function createComponent(
  fn: (props: any) => ReturnType<CreateFunction>,
  passInView?: Partial<View> & { props?: any },
) {
  const options = createComponentForMini(fn);
  const view = {
    ...createDefaultInstance(),
    ...passInView,
  };

  return {
    mount: () => {
      options.didMount?.call(view);
    },
  };
}
