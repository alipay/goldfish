const cp = require('child_process');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const cwd = process.cwd();

function log(...args) {
  console.log(chalk.bold.green('[Goldfish]'), ...args);
}

function error(...args) {
  console.error(chalk.bold.red('[Goldfish]'), ...args);
}

function warn(...args) {
  console.error(chalk.bold.yellow('[Goldfish]'), ...args);
}

exports.log = log;

exports.error = error;

exports.warn = warn;

exports.exec = (cmd, options) => {
  return new Promise((resolve, reject) => {
    log(`start executing: ${cmd}, cwd: ${options && options.cwd || cwd}`);

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

const distDir = path.resolve(cwd, require(`${cwd}${path.sep}mini.project.json`).dist || 'dist');
exports.distDir = distDir;

const dir = `${cwd}${path.sep}.cache`;
const cacheFilePath = `${dir}${path.sep}mtimes`;
if (!fs.existsSync(cacheFilePath)) {
  fs.ensureFileSync(cacheFilePath);
  fs.writeJSONSync(cacheFilePath, {});
}
let mtimesJson = fs.readJSONSync(cacheFilePath);
exports.recordFileUpdateTime = (filePath) => {
  const stats = fs.statSync(filePath);
  const time = stats.mtimeMs;

  mtimesJson = {
    ...mtimesJson,
    [filePath]: time,
  };
  fs.writeJSONSync(cacheFilePath, mtimesJson);
}

function getCompiledPath(sourceFilePath, sourceType) {
  const type = sourceType.check(sourceFilePath);
  const interTargetPath = path.resolve(distDir, '.' + sourceFilePath.replace(cwd, ''));

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
