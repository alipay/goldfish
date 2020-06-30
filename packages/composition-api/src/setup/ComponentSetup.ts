import CommonSetup from './CommonSetup';
import { ComponentStore } from '@goldfishjs/core';
import { ComponentInstance } from '@goldfishjs/reactive-connect';

type Methods = tinyapp.IComponentLifeCycleMethods<any, any>;

export type SetupComponentStore = ComponentStore<any>;

export type SetupComponentInstance = ComponentInstance<any, any, ComponentStore<any>, {}>;

export default class ComponentSetup extends CommonSetup<Methods, SetupComponentStore, SetupComponentInstance> {}
