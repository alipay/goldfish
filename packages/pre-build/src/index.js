const yargs = require('yargs');
const compileCommand = require('./commands/compile');

yargs.scriptName('fishmate').usage('Usage: $0 <command> [options]');
[
  compileCommand,
].forEach(c => {
  yargs.command(c.name, c.description, c.builder, c.handler);
});
yargs.demandCommand(1, 'At least 1 parameter is required.');

yargs.parse();
