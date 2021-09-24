import { useRendersCount } from 'react-use/esm/useRendersCount';
import renderHook from './renderHook';
import timeout from './timeout';

describe('useRendersCount', () => {
  it('should be defined', () => {
    expect(useRendersCount).toBeDefined();
  });

  it('should return number', () => {
    expect(renderHook(() => useRendersCount()).result.current).toEqual(expect.any(Number));
  });

  it('should return actual number of renders', async () => {
    const hook = renderHook(() => useRendersCount());

    expect(hook.result.current).toBe(1);

    hook.rerender();
    await timeout();
    expect(hook.result.current).toBe(2);

    hook.rerender();
    await timeout();
    expect(hook.result.current).toBe(3);
  });
});
