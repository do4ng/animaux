# Animaux

Javascript Library for CLI applications.

### TODO

- [ ] Add `program.example()`
- [ ] Write Documentation

## Usage

#### Code

```js
#!/usr/bin/env node

const program = require('animaux');
const app = new program('my-app');

app.version('1.0.0').action((command) => {
  console.log(`> Cannot execute ${command}`);
});

app
  .command('build <src>')
  .describe('build amazing application!')
  .option('--output, -o', 'Provide output path.', 'out.js')
  .action((src, options) => {
    console.log(`Building "${src}"...`);
    console.log('  options: ', options);
  });

app.parse(process.argv);
```

#### Result

```
$ my-app --help

  Usage
    $ my-app <command> [options]

  Commands
    build        build amazing application!

  Options
    --help, -h       Displays help information.
    --version, -v    Displays current version.
    --output, -o     Provide output path. (default out.js)

  Run `my-app <command> --help` for more information.
```

```
$ my-app build --help

  Usage
    $ my-app build <src>

  build amazing application!

  Alias
    $ my-app b
    $ my-app build

  Options
    --help, -h       Displays help information.
    --version, -v    Displays current version.
    --output, -o     Provide output path. (default out.js)

$ my-app build index.ts --output build.js
Building "index.ts"...
  options:  { output: 'build.js', __: [ 'build', 'index.ts' ] }
```

## License

MIT
