import { useState as baseUseState, reactive } from '@goldfishjs/composition-api';
import useContextType from './useContextType';

export default function useState<T extends Record<string, any>>(val: T): T {
  const type = useContextType();
  if (type === 'react') {
    return reactive(val);
  }

  return baseUseState(val);
}
