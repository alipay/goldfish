import { ComponentInstance } from '@goldfishjs/reactive-connect';
import CommonSetup from './CommonSetup';
import ComponentStore from '../connector/store/ComponentStore';

type Methods = tinyapp.IComponentLifeCycleMethods<any, any>;

export type SetupComponentStore = ComponentStore<any>;

export type SetupComponentInstance = ComponentInstance<any, any, ComponentStore<any>, {}>;

export default class ComponentSetup extends CommonSetup<Methods, SetupComponentStore, SetupComponentInstance> {}
