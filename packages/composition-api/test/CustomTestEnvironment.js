const JSDOMEnvironment = require('jest-environment-jsdom');
const _ = require('lodash');

class CustomEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();

    let app = {};
    this.global.setApp = passInApp => {
      app = passInApp;
    };
    this.global.getApp = () => {
      return app;
    };
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = CustomEnvironment;
