import { useContextType as baseUseContextType } from '@goldfishjs/composition-api';
import ComponentSetup from './ComponentSetup';

export default function useContextType() {
  const setup = ComponentSetup.getCurrent();
  if (setup && setup instanceof ComponentSetup) {
    return 'react';
  }
  return baseUseContextType();
}
