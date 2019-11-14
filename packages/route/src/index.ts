import Route from './Route';
import { TinyAppRouter as BaseTinyappRoute } from './container-router';

class TinyappRoute extends Route {
  protected route = new BaseTinyappRoute();
}

export default new TinyappRoute();