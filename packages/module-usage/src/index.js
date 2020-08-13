const cp = require('child_process');

try {
  cp.exec('npm i @alife/goldfish-module-usage@latest --registry=http://registry.npm.alibaba-inc.com --no-package-lock --no-save');
} catch (e) {}
