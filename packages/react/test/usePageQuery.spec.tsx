import { setupPage } from '@goldfishjs/composition-api';
import usePageQuery from '../src/usePageQuery';
import { createPageInstance, timeout } from './utils';

it('should get the page query in mini-program.', async () => {
  const page = createPageInstance();

  const options = setupPage(() => {
    const query = usePageQuery();
    return {
      query,
    };
  });
  options.onLoad?.call(page, { name: 'zs' });

  await timeout();
  expect(page.result.result.current).toMatchObject({ query: { name: 'zs' } });
});
