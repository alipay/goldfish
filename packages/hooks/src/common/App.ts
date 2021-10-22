export default class App {
  public data: Record<string, any> = {};
  public dataChangeUpdaters: Record<string, Array<() => void>> = {};
}

export const app = new App();
