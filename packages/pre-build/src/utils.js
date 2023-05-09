const cp = require('child_process');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const lodash = require('lodash');
const concurrently = require('concurrently');
const commandExists = require('command-exists');

const cwd = process.cwd();
exports.cwd = cwd;

function log(...args) {
  console.log(chalk.bold.green('[LOG]'), ...args);
}

function error(...args) {
  console.error(chalk.bold.red('[ERROR]'), ...args);
}

function warn(...args) {
  console.error(chalk.bold.yellow('[WARN]'), ...args);
}

exports.log = log;

exports.error = error;

exports.warn = warn;

exports.exec = (cmd, options) => {
  const needInput = options ? !!options.needInput : false;
  const color = options ? (options.color !== false ? true : false) : true;
  const prefix = options ? options.prefix : '';
  const localCwd = (options && options.cwd) || cwd;
  const env = {
    ...process.env,
    ...(options && options.env ? options.env : {}),
  };

  return new Promise((resolve, reject) => {
    if (prefix) {
      concurrently(
        [{ command: `${cmd}${color ? ' --color' : ''}`, cwd: localCwd, name: prefix, env, prefixColor: '#00a0e9' }],
        {
          prefix,
          inputStream: needInput ? process.stdin : undefined,
        },
      ).then(resolve, reject);
    } else {
      log(`start executing: ${cmd}, cwd: ${localCwd}`);

      let p;
      try {
        p = cp.exec(`${cmd}${color ? ' --color' : ''}`, { ...options, env, cwd: localCwd });
      } catch (e) {
        log(`failed executing: ${cmd}, \n ${e} \n`);
        throw e;
      }

      if (needInput) {
        process.stdin.pipe(p.stdin);
      }

      p.stdout.pipe(process.stdout);
      p.stderr.pipe(process.stderr);

      p.on('exit', code => {
        needInput && process.stdin.unref();
        log(`complete executing: ${cmd}, with code: ${code}\n`);
        code === 0 ? resolve() : reject(code);
      });
    }
  });
};

const miniProjectConfigFilePath = `${cwd}${path.sep}mini.project.json`;
const miniProjectConfig = fs.existsSync(miniProjectConfigFilePath) ? require(miniProjectConfigFilePath) : {};

const distDir = path.resolve(cwd, process.env.OUT_DIR || lodash.get(miniProjectConfig, 'dist', 'dist'));
exports.distDir = distDir;

const baseDir = path.resolve(
  cwd,
  process.env.BASE_DIR || lodash.get(miniProjectConfig, 'compilerOptions.baseDir', '.'),
);
exports.baseDir = baseDir;

const tsconfigPath = path.resolve(
  cwd,
  process.env.TSCONFIG_PATH || lodash.get(miniProjectConfig, 'compilerOptions.tsconfigPath', './tsconfig.json'),
);
exports.tsconfigPath = tsconfigPath;

function getCompiledPath(sourceFilePath, sourceType) {
  const relativeSourcePath = '.' + sourceFilePath.replace(cwd, '');
  const type = sourceType.check(relativeSourcePath.replace(/^.\//, ''));
  const interTargetPath = path.resolve(
    distDir,
    sourceFilePath.replace(exports.baseDir + path.sep, ''),
  );

  if (type === 'ts') {
    return interTargetPath.replace(/\.ts$/, '.js');
  }

  if (type === 'less') {
    return interTargetPath.replace(/\.less$/, '.acss');
  }

  return interTargetPath;
}

exports.getCompiledPath = getCompiledPath;

exports.getBinCommand = (pkgName, commandName, paths) => {
  const pkgPath = require.resolve(`${pkgName}/package.json`, paths);
  const pkgJson = fs.readJSONSync(pkgPath);

  let commandPath = path.normalize(pkgPath.replace(/package\.json$/, (pkgJson.bin || {})[commandName]));
  if (fs.existsSync(commandPath)) {
    return process.platform === 'win32' ? `node ${commandPath}` : commandPath;
  }

  throw new Error(`Can not find the command under: ${pkgPath}`);
};

exports.getNPMCommand = async () => {
  const candidate = ['tnpm', 'npm', 'yarn'];
  for (let i = 0, il = candidate.length; i < il; i++) {
    if (await commandExists(candidate[i])) {
      return 'tnpm';
    }
  }

  throw new Error(`Can not find these commands: ${candidate.join(', ')}`);
};

exports.execCallback = async (filePath, onSuccess) => {
  const realOnSuccess = onSuccess || process.env.ON_SUCCESS_CALLBACK;
  if (!realOnSuccess) {
    return;
  }
  try {
    await exports.exec(realOnSuccess, {
      color: true,
      env: {
        HANDLED_FILE_PATH: filePath,
      },
    });
  } catch (e) {
    error(e);
  }
}
