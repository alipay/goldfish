const cp = require('child_process');

try {
  const p = cp.exec('tnpm i @alife/goldfish-module-usage@latest --no-package-lock --no-save --by=npm');
  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);
} catch (e) {}
