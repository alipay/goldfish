import { useRendersCount } from 'react-use/esm/useRendersCount';
import renderHook from './renderHook';

describe('useRendersCount', () => {
  it('should be defined', () => {
    expect(useRendersCount).toBeDefined();
  });

  it('should return number', () => {
    expect(renderHook(() => useRendersCount()).result.current).toEqual(expect.any(Number));
  });

  it('should return actual number of renders', () => {
    const hook = renderHook(() => useRendersCount());

    expect(hook.result.current).toBe(1);
    hook.rerender();
    expect(hook.result.current).toBe(2);
    hook.rerender();
    expect(hook.result.current).toBe(3);
  });
});
