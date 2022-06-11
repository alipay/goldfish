import { useMemo } from 'react';
import { parse } from 'qs';

export default function usePageQuery4React(): Record<string, any> {
  return useMemo(
    () =>
      parse(window.location.search, {
        decoder: (str, defaultDecoder, charset, type) => {
          if (type === 'value') {
            if (str === 'true') {
              return true;
            }
            if (str === 'false') {
              return false;
            }

            const num = Number(str);
            if (!Number.isNaN(num)) {
              return num;
            }
          }
          return str;
        },
      }) || {},
    [],
  );
}
