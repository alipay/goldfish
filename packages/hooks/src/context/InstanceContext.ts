import createContextStack from '../common/createContextStack';
import Context from './Context';
import { IHostInstance, CreateFunction } from '../connector/create';

const { push, pop, getCurrent } = createContextStack<InstanceContext>();

export { getCurrent };

export type ContainerType = 'app' | 'component' | 'page';

export default class InstanceContext extends Context {
  private instance: IHostInstance<any> | null = null;

  private containerType: ContainerType | undefined = undefined;

  public set(instance: IHostInstance<any>) {
    this.instance = instance;
  }

  public get() {
    return this.instance;
  }

  public setContainerType(type?: ContainerType) {
    this.containerType = type;
  }

  public getContainerType() {
    return this.containerType;
  }

  public wrap(fn: () => ReturnType<CreateFunction>) {
    return () => {
      push(this);
      try {
        return super.wrapExecutor(fn);
      } catch (e) {
        throw e;
      } finally {
        pop();
      }
    };
  }
}
