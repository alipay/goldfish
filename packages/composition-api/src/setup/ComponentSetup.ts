import { ComponentInstance } from '@goldfishjs/reactive-connect';
import CommonSetup from './CommonSetup';

type Methods = tinyapp.IComponentLifeCycleMethods<any, any>;

export type SetupComponentInstance = ComponentInstance<any, any, any, any>;

export default class ComponentSetup extends CommonSetup<Methods, SetupComponentInstance> {
  public props: Record<string, any> = {};

  public syncProps(newProps: Record<string, any>) {
    for (const key in newProps) {
      if (key in this.props) {
        this.props[key] = newProps[key];
      }
    }
  }

  public destroy() {
    super.destroy();
    this.props = {};
  }
}
