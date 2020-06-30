export default function interval(fn: () => void, duration: number) {
  let timer: ReturnType<typeof setTimeout>;
  const start = () => {
    timer = setTimeout(() => {
      try {
        fn();
      } catch (e) {
        throw e;
      } finally {
        start();
      }
    }, duration);
  };
  start();

  return () => {
    clearTimeout(timer);
  };
}
