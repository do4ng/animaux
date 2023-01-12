#!/usr/bin/env node

const program = require('../dist');

const app = program('my-app');

app.version('1.0.0').action((command) => {
  console.log(`> Cannot execute ${command}`);
});

app
  .command('build <src>', ['b'])
  .describe('build amazing application!')
  .option('--output, -o', 'Provide output path.', 'out.js')
  .action((src, options) => {
    console.log(`Building "${src}"...`);
    console.log('  options: ', options);
  });

app.parse(process.argv);
