import AppSetup from './AppSetup';
import ComponentSetup from './ComponentSetup';
import PageSetup from './PageSetup';

class Manager {
  private map: Record<string, ComponentSetup | PageSetup | AppSetup | null> = {};

  public add(id: string, setup: ComponentSetup | PageSetup | AppSetup) {
    if (!this.map[id]) {
      this.map[id] = setup;
    }
  }

  public get(id: string) {
    return this.map[id];
  }

  public remove(id: string) {
    if (this.map[id]) {
      this.map[id] = null;
    }
  }
}

export default new Manager();
