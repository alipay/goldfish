import bridge, { BridgeMethods, APBridgeMethods } from '../src/index';

describe('bridge', () => {
  it('native bridge function', async () => {
    const result1 = await bridge.call('getAuthCode', {
      scopes: 'auth_base',
    });
    result1.authCode;

    const result2 = await bridge.call('reportCustomError', new Error('test'));

    return Promise.resolve().then(() => {
      expect(1).toBe(1);
    });
  });

  it('custom bridge function', async () => {
    interface IOptions {
      path: string;
      success?: (res: { a: number }) => void;
    }

    interface ICustomBridge extends BridgeMethods {
      test: (options: IOptions) => void;
    }

    const result1 = await bridge.call<'test', ICustomBridge>('test', {
      path: 'test',
    });
    result1.a;

    return Promise.resolve().then(() => {
      expect(1).toBe(1);
    });
  });

  it('call bridge function', async () => {
    const result1 = await bridge.mycall('test', {
      a: '1',
    });

    return Promise.resolve().then(() => {
      expect(1).toBe(1);
    });
  });

  it('custom call bridge function', async () => {
    interface IStartupParams {
      a: number;
    }

    interface IStartupParamsResult {
      url: string;
      xxx: number;
    }

    const result2 = await bridge.mycall<IStartupParamsResult, IStartupParams>('test', {
      a: 1,
    });
    result2.url;

    return Promise.resolve().then(() => {
      expect(1).toBe(1);
    });
  });

  it('ap bridge function', async () => {

    const result2 = await bridge.ap('navigateToAlipayPage', {
      path: 'test',
    });
    result2.success;

    return Promise.resolve().then(() => {
      expect(1).toBe(1);
    });
  });

  it('custom ap bridge function', async () => {
    interface IOptions {
      b: string;
      success?: (res: { a: number }) => void;
    }

    interface ICustomBridge extends APBridgeMethods {
      test: (options: IOptions) => void;
    }

    const result2 = await bridge.ap<'test', ICustomBridge>('test', {
      b: 'test',
    });
    result2.a;

    return Promise.resolve().then(() => {
      expect(1).toBe(1);
    });
  });
});
