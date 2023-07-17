import yargs from 'yargs';
import * as compileCommand from './commands/compile';
import * as devCommand from './commands/dev';
import * as npmCommand from './commands/npm';
import * as npmDevCommand from './commands/npm-dev';
import * as compilePdsCommand from './commands/compile-pds';
import * as devPdsCommand from './commands/dev-pds';

yargs.scriptName('goldfish').usage('Usage: $0 <command> [options]');
[
  compileCommand,
  devCommand,
  npmCommand,
  npmDevCommand,
  // pds
  compilePdsCommand,
  devPdsCommand,
].forEach(c => {
  yargs.command(c.name, c.description, c.builder, c.handler);
});
yargs.demandCommand(1, 'At least 1 parameter is required.');

yargs.parse();
