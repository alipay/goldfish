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

it('should not have `onShareAppMessage`.', () => {
  const options = setupApp(() => {
    return {};
  });

  expect(options).not.toHaveProperty('onShareAppMessage');
});
