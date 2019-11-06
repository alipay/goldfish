const JSDOMEnvironment = require('jest-environment-jsdom');
const _ = require('lodash');

class CustomEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();
    this.global.changeUserAgent = () => {
      this.dom.reconfigure
    };

    this.global.mockEnv = (options) => {
      const restoreFns = [];

      _.each(options, (value, key) => {
        if (key === 'url') {
          const backupUrl = this.dom.window.location.href;
          restoreFns.push(() => {
            this.dom.reconfigure({ url: backupUrl });
          });
          this.dom.reconfigure({ url: value });
          return;
        }

        if (key === 'userAgent') {
          const backUserAgent = this.dom.window.navigator.userAgent;
          restoreFns.push(() => {
            Object.defineProperty(this.dom.window.navigator, 'userAgent', {
              value: backUserAgent,
              configurable: true,
            });
          });
          Object.defineProperty(this.dom.window.navigator, 'userAgent', {
            value,
            configurable: true,
          });
          return;
        }

        const backupProperty = this.dom.window[key];
        restoreFns.push(() => {
          Object.defineProperty(this.dom.window, key, {
            value: backupProperty,
            configurable: true,
          });
        });
        Object.defineProperty(this.dom.window, key, {
          value,
          configurable: true,
        });
      });

      return () => {
        restoreFns.forEach(fn => fn());
      };
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
