import setupPage from '../src/setupPage';

it('should not have `onShareAppMessage`.', () => {
  const options = setupPage(() => {
    return {};
  });

  expect(options).not.toHaveProperty('onShareAppMessage');
});
