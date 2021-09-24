import { useFirstMountState } from 'react-use/esm/useFirstMountState';
import renderHook from './renderHook';
import timeout from './timeout';

describe('useFirstMountState', () => {
  it('should be defined', () => {
    expect(useFirstMountState).toBeDefined();
  });

  it('should return boolean', () => {
    expect(renderHook(() => useFirstMountState()).result.current).toEqual(expect.any(Boolean));
  });

  it('should return true on first render and false on all others', async () => {
    const hook = renderHook(() => useFirstMountState());

    expect(hook.result.current).toBe(true);

    hook.rerender();
    await timeout();
    expect(hook.result.current).toBe(false);

    hook.rerender();
    await timeout();
    expect(hook.result.current).toBe(false);
  });
});
