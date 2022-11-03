const yargs = require('yargs');
const compileCommand = require('./commands/compile');
const devCommand = require('./commands/dev');
const npmCommand = require('./commands/npm');
const compilePdsCommand = require('./commands/compile-pds');
const devPdsCommand = require('./commands/dev-pds');

yargs.scriptName('goldfish').usage('Usage: $0 <command> [options]');
[
  compileCommand,
  devCommand,
  npmCommand,
  // pds
  compilePdsCommand,
  devPdsCommand
].forEach(c => {
  yargs.command(c.name, c.description, c.builder, c.handler);
});
yargs.demandCommand(1, 'At least 1 parameter is required.');

yargs.parse();
