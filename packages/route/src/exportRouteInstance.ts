import Route from './Route';
import { default as BaseTinyappRoute } from './container-router/TinyAppRouter';

class TinyappRoute extends Route {
  protected route = new BaseTinyappRoute();
}

export default new TinyappRoute();
