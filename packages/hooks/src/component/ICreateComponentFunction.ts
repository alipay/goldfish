export default interface ICreateComponentFunction {
  (): {
    data: Record<string, any>;
  };
}
