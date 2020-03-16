import ComponentSetup from './ComponentSetup';

export default function useMount(fn: () => void) {
  const setup = ComponentSetup.getCurrent<ComponentSetup>();
  setup.mountFns.push(fn);
}
