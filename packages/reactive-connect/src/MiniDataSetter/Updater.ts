import SetTree from './SetTree';
import SpliceTree from './SpliceTree';
import LimitLeafCounter from './LimitLeafCounter';

type IterateSetCallback = (obj: Record<string, any>) => void;
type IterateSpliceCallback = (obj: Array<Record<string, [number, number, ...any[]]>>) => void;

export default class Updater {
  private list: (SetTree | SpliceTree)[] = [];

  private limitLeafCounter = new LimitLeafCounter();

  private obj: any;

  public constructor(obj: any) {
    this.obj = obj;
  }

  public setSetObjectValue(keyPathString: string, value: any) {
    let last = this.list[this.list.length - 1];
    if (!last || !(last instanceof SetTree)) {
      last = new SetTree(this.limitLeafCounter);
      this.list.push(last);
    }

    last.addNode(keyPathString, value);
  }

  public setSpliceObjectValue(
    keyPathString: string,
    newV: any[],
    oldV: any[],
  ) {
    let last = this.list[this.list.length - 1];
    if (!last || last instanceof SetTree) {
      last = new SpliceTree();
      this.list.push(last);
    }

    last.addNode(keyPathString, newV, oldV);
  }

  public iterate(setCb: IterateSetCallback, spliceCb: IterateSpliceCallback) {
    this.list.forEach((item) => {
      if (item instanceof SetTree) {
        setCb(item.generate(this.obj));
      } else {
        spliceCb(item.generate());
      }
    });
  }
}
