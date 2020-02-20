/// <reference types="mini-types" />
import { ChangeOptions } from '@goldfishjs/reactive';
export declare class Batch {
    private segTotalList;
    private counter;
    private cb;
    constructor(cb: () => void);
    set(): Promise<void>;
}
declare type View = tinyapp.IPageInstance<any> | tinyapp.IComponentInstance<any, any>;
export default class MiniDataSetter {
    private count;
    private viewMap;
    private updaterMap;
    private getBatchUpdates;
    private flush;
    private setValue;
    private setByKeyPathList;
    set(view: View, keyPathList: (string | number)[], newV: any, oldV: any, options?: ChangeOptions): void;
}
export {};
