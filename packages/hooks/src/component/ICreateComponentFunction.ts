export default interface ICreateComponentFunction<P> {
  (props: P): {
    data: Record<string, any>;
  };
}
