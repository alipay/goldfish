import { setupPage } from '@goldfishjs/composition-api';
import useFeedback from '../src/useFeedback';
import useGlobalStorage from '../src/useGlobalStorage';
import { timeout, createPageInstance } from './utils';
import App from '../src/App';

it('should initialize the feedback instance.', async () => {
  const app = new App();
  const options = setupPage(() => {
    useFeedback(app);
    const storage = useGlobalStorage<{ $$feedback?: any }>(app);
    return {
      feedback: !!storage.get('$$feedback'),
    };
  });

  const page = createPageInstance();
  options.onLoad?.call(page, {});

  await timeout();
  expect(page.result.result.current).toMatchObject({ feedback: true });
});

it('should alert.', async () => {
  const alert = jest.fn();
  const app = new App();
  const options = setupPage(() => {
    const feedback = useFeedback(app);
    feedback.setView({
      alert,
    });
    feedback.addAlert({});
    return {};
  });

  const page = createPageInstance();
  options.onLoad?.call(page, {});

  expect(alert.mock.calls.length).toBe(1);
});

it('should block the next alert.', async () => {
  let counter = 0;
  const alert = jest.fn(async (options: any) => {
    counter++;
    await timeout();
    options.complete();
  });

  const app = new App();
  const options = setupPage(() => {
    const feedback = useFeedback(app);
    feedback.setView({
      alert,
    });
    feedback.addAlert({
      isBlock: true,
    });
    feedback.addAlert({
      isBlock: true,
    });
    return {};
  });

  const page = createPageInstance();
  options.onLoad?.call(page, {});

  expect(counter).toBe(1);
  await timeout();
  expect(counter).toBe(2);
});
