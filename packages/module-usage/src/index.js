const cp = require('child_process');

try {
  const p = cp.exec('npm i @alife/goldfish-module-usage@latest --registry=http://registry.npm.alibaba-inc.com --no-package-lock --no-save');
  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);
} catch (e) {}
