import { setupPage } from '@goldfishjs/composition-api';
import useState from '../src/useState';
import usePageQuery from '../src/usePageQuery';
import { createPageInstance, timeout } from './utils';

it('should get the page query in mini-program.', async () => {
  const page = createPageInstance();

  const options = setupPage(() => {
    const query = usePageQuery();
    const state = useState({
      query: null,
    });
    query?.then(data => {
      state.query = data;
    });
    return {
      state,
    };
  });
  page.data = (options.data as any).call(page);
  options.onLoad?.call(page, { name: 'zs' });

  await timeout();
  expect(page.result.result.current).toMatchObject({ state: { query: { name: 'zs' } } });
});
