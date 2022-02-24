import { useMemo } from 'react';
import { parse } from 'query-string';

export default function usePageQuery4React(): Record<string, any> {
  return useMemo(
    () =>
      parse(window.location.search, {
        parseBooleans: true,
        parseNumbers: true,
      }) || {},
    [],
  );
}
