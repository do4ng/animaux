#!/usr/bin/env node

const program = require('../dist');

const app = new program.CLI('greeting').version('1.0.0');

app
  .command('hello <name>')
  .describe('Greets the user')
  .option('--greet', 'Greet message', 'Hello')
  .option('--from', 'From', 'Cat')
  .action(({ args, options }) => {
    console.log(`${options.from} says "${options.greet}, ${args.name}"`);
  });

app.parse(process.argv.slice(2));
