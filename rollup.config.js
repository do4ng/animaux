// const terser = require('@rollup/plugin-terser');
const ts = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.ts',
  output: [
    {
      format: 'esm',
      file: pkg.module,
      strict: false,
    },
    {
      format: 'cjs',
      file: pkg.main,
      strict: false,
    },
  ],
  external: [...Object.keys(pkg.dependencies), ...require('module').builtinModules],
  plugins: [ts.default({})],
};
module.exports = config;
