import { useProps as baseUseProps } from '@goldfishjs/composition-api';
import ComponentSetup from './ComponentSetup';

export default function useProps<P>(): P {
  const setup = ComponentSetup.getCurrent();
  if (setup instanceof ComponentSetup) {
    return setup.props;
  }

  return baseUseProps<P>();
}
