import setupApp from '../src/setupApp';

it('should create the app options.', () => {
  const options = setupApp(() => {
    return {};
  });
  expect(options).toHaveProperty('onLaunch');
  expect(options).toHaveProperty('onShow');
  expect(options).toHaveProperty('onHide');
  expect(options).toHaveProperty('onError');
});

it('should put a `$setup` to the app instance.', () => {
  const options = setupApp(() => {
    return {};
  });

  const app = { $setup: null };
  setApp(app);
  options.onLaunch?.call(app, {});
  expect(app.$setup).not.toBeNull();
});

it('should not have `onShareAppMessage`.', () => {
  const options = setupApp(() => {
    return {};
  });

  expect(options).not.toHaveProperty('onShareAppMessage');
});
