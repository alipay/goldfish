const cp = require('child_process');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const lodash = require('lodash');

const cwd = process.cwd();

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
        p = cp.exec(`${cmd}${color ? ' --color' : ''}`, { env: process.env, ...options, cwd: localCwd });
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

const dir = `${cwd}${path.sep}.cache`;
const cacheFilePath = `${dir}${path.sep}mtimes`;
if (!fs.existsSync(cacheFilePath)) {
  fs.ensureFileSync(cacheFilePath);
  fs.writeJSONSync(cacheFilePath, {});
}
let mtimesJson = fs.readJSONSync(cacheFilePath);
exports.recordFileUpdateTime = filePath => {
  const stats = fs.statSync(filePath);
  const time = stats.mtimeMs;

  mtimesJson = {
    ...mtimesJson,
    [filePath]: time,
  };
  fs.writeJSONSync(cacheFilePath, mtimesJson);
};

function getCompiledPath(sourceFilePath, sourceType) {
  const relativeSourcePath = '.' + sourceFilePath.replace(cwd, '');
  const type = sourceType.check(relativeSourcePath.replace(/^.\//, ''));
  const interTargetPath = path.resolve(
    distDir,
    exports.isMinifishProject ? relativeSourcePath.replace(new RegExp(`^\\.\\/src\\/`), '') : relativeSourcePath,
  );

  if (type === 'ts') {
    return interTargetPath.replace(/\.ts$/, '.js');
  }

  if (type === 'less') {
    return interTargetPath.replace(/\.less$/, '.acss');
  }

  return interTargetPath;
}

exports.shouldCompileFile = (filePath, sourceType) => {
  const compiledFilePath = getCompiledPath(filePath, sourceType);
  const hasCompiledFile = fs.existsSync(compiledFilePath);
  if (!hasCompiledFile) {
    return true;
  }

  const recordModifyTime = mtimesJson[filePath];
  const lastModifyTime = fs.statSync(filePath).mtimeMs;
  if (!lastModifyTime) {
    return true;
  }

  const isModified = lastModifyTime > recordModifyTime;
  return isModified;
};

exports.getCompiledPath = getCompiledPath;
