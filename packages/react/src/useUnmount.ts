import ComponentSetup from './ComponentSetup';

export default function useUnmount(fn: () => void) {
  const setup = ComponentSetup.getCurrent<ComponentSetup>();
  setup.unmountFns.push(fn);
}
