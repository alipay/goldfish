const cp = require('child_process');
const chalk = require('chalk');

function log(...args) {
  console.log(chalk.bold.green('[Goldfish]'), ...args);
}

function error(...args) {
  console.error(chalk.bold.red('[Goldfish]'), ...args);
}

exports.log = log;

exports.error = error;

exports.exec = (cmd, options) => {
  return new Promise((resolve, reject) => {
    log(`start executing: ${cmd}, cwd: ${options && options.cwd || process.cwd()}`);

    let p;
    try {
      p = cp.exec(cmd, options);
    } catch (e) {
      log(`failed executing: ${cmd}, \n ${e} \n`);
      throw e;
    }

    p.stdout.on('data', chunk => {
      process.stdout.write(chunk);
    });
    p.stderr.on('data', chunk => {
      process.stderr.write(chunk);
    });

    p.on('exit', (code) => {
      log(`complete executing: ${cmd}, with code: ${code}\n`);
      code === 0 ? resolve() : reject(code);
    });
  });
};
