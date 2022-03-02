import setupApp from '../src/setupApp';
import useAppLifeCycle from '../src/useAppLifeCycle';

it('should have the `onShareAppMessage`.', () => {
  const options = setupApp(() => {
    useAppLifeCycle('onShareAppMessage', () => {
      return { title: 'title', path: 'path' };
    });
    return {};
  });

  const app = {
    globalData: options.globalData,
  };
  setApp(app);
  options.onLaunch?.call(app, {});
  expect(app).toHaveProperty('onShareAppMessage');
  expect((app as any).onShareAppMessage({ from: 'menu' })).toEqual({ title: 'title', path: 'path' });
});

it('shoule merge the mutiple `onShareAppMessage` results.', () => {
  const options = setupApp(() => {
    useAppLifeCycle('onShareAppMessage', () => {
      return { title: 'title1', path: 'path1', desc: 'desc1' };
    });
    useAppLifeCycle('onShareAppMessage', () => {
      return { title: 'title2', path: 'path2' };
    });
    return {};
  });

  const app = {
    globalData: options.globalData,
  };
  setApp(app);
  options.onLaunch?.call(app, {});
  expect(app).toHaveProperty('onShareAppMessage');
  expect((app as any).onShareAppMessage({ from: 'menu' })).toEqual({ title: 'title2', path: 'path2', desc: 'desc1' });
});
