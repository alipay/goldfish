import createContextStack from '../common/createContextStack';
import InstanceEventContext from './InstanceEventContext';

const { push, pop, getCurrent } = createContextStack<PageEventContext>();

export { getCurrent };

export type OptionsEventName =
  | 'onLoad'
  | 'onShow'
  | 'onReady'
  | 'onHide'
  | 'onUnload'
  | 'onShareAppMessage'
  | 'onPageScroll'
  | 'onReachBottom';
export type EventName = keyof tinyapp.IPageEvents | OptionsEventName;

export type Instance = Pick<tinyapp.IPageEvents & tinyapp.IPageOptionsMethods, EventName>;

export default class PageEventContext extends InstanceEventContext<Instance> {
  public constructor() {
    super(push, pop);
  }
}
