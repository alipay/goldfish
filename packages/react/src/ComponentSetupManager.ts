import ComponentSetup from './ComponentSetup';

let counter = 0;

export default class ComponentSetupManager {
  private map: Record<string, ComponentSetup> = {};

  public add(id: string, setup: ComponentSetup) {
    if (!id) {
      throw new Error(`Wrong id: ${id}`);
    }
    this.map[id] = setup;
  }

  public get(id: string) {
    return this.map[id];
  }

  public genId() {
    return `setup-${counter++}`;
  }
}

export const setupManager = new ComponentSetupManager();
