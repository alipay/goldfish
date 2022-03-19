import View from '../src/common/View';
import { CreateFunction } from '../src/connector/create';
import createComponentForMini from '../src/connector/createComponent';
import createComponentInstance from './common/createComponentInstance';

export function createDefaultInstance() {
  const instance = {
    ...createComponentInstance(),
    setData: jest.fn(),
    $viewId: `${Math.random()}-${Date.now()}`,
    $spliceData: jest.fn(),
  };
  instance.$page.$batchedUpdates = (fn: () => void) => fn();
  return instance;
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
      view.data = options.data.call();
      options.didMount?.call(view);
    },
    getComponentInstance() {
      return view;
    },
  };
}
