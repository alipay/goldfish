import Context from './Context';
import createContextStack from '../common/createContextStack';
import { CreateFunction } from '../connector/create';

export type Push = ReturnType<typeof createContextStack>['push'];
export type Pop = ReturnType<typeof createContextStack>['pop'];

export default class CacheContext<V> extends Context {
  protected arr: Array<{
    value: V;
    deps?: React.DependencyList;
  }> = [];

  protected index = 0;

  private push: Push;

  private pop: Pop;

  public constructor(push: Push, pop: Pop) {
    super();
    this.push = push;
    this.pop = pop;
  }

  public wrap(fn: () => ReturnType<CreateFunction>) {
    return () => {
      this.index = 0;
      this.push(this);
      try {
        return super.wrapExecutor(fn);
      } catch (e) {
        throw e;
      } finally {
        this.pop();
      }
    };
  }

  public destroy() {
    this.arr = [];
    this.index = 0;
  }
}
