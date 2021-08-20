import createContextStack from '../common/createContextStack';
import InstanceEventContext from './InstanceEventContext';

export interface IAppOptionsMethods extends tinyapp.IAppOptionsMethods {
  onUnhandledRejection?(options?: { reason: string; promise: Promise<any> }): void;
}

const { push, pop, getCurrent } = createContextStack<AppEventContext>();

export { getCurrent };

export type EventName = keyof IAppOptionsMethods;

export interface IAppEvent<T extends EventName> {
  name: T;
  callback: Required<IAppOptionsMethods>[T];
}

export type Instance = IAppOptionsMethods;

export default class AppEventContext extends InstanceEventContext<Instance> {
  public constructor() {
    super(push, pop);
  }
}
