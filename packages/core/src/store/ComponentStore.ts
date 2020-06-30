import { ComponentStore as BaseComponentStore, IProps } from '@goldfishjs/reactive-connect';
import AppStore from './AppStore';

/**
 * State management for Component.
 */
abstract class ComponentStore<P extends IProps, GS = AppStore> extends BaseComponentStore<P, GS> {}

export default ComponentStore;
