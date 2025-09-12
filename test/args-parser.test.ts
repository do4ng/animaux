import { argsParser } from '../src/parser';

describe('argsParser: Core Functionality', () => {
  test('should parse only positional arguments', () => {
    expect(argsParser(['install'])).toEqual({ __: ['install'] });
  });

  test('should handle positional arguments, key-value pairs, and ignore empty strings', () => {
    expect(argsParser(['install', 'awesome-app', '--hello=world', ''])).toEqual({
      __: ['install', 'awesome-app'],
      hello: 'world',
    });
  });

  test('should parse a short option with its value', () => {
    expect(argsParser(['build', 'index.ts', '-O', 'out.js'])).toEqual({
      __: ['build', 'index.ts'],
      O: 'out.js',
    });
  });

  test('should parse grouped short options', () => {
    expect(argsParser(['-abcd', '10'])).toEqual({
      __: [],
      a: true,
      b: true,
      c: true,
      d: 10,
    });
  });

  test('should parse a mix of long and short options', () => {
    expect(
      argsParser(['build', 'index.ts', '-O', 'out.js', '--config', 'config.json'])
    ).toEqual({
      __: ['build', 'index.ts'],
      O: 'out.js',
      config: 'config.json',
    });
  });

  test('should handle aliases correctly', () => {
    expect(
      argsParser(['build', 'index.ts', '-O', 'out.js', '-c', 'config.json'], {
        names: { config: 'c', output: ['O', 'o'] },
      })
    ).toEqual({
      __: ['build', 'index.ts'],
      output: 'out.js',
      config: 'config.json',
    });
  });

  test('should handle repeated options as an array', () => {
    expect(
      argsParser(['add', '-c', '10', '-c', '20'], {
        names: { count: ['c'] },
      })
    ).toEqual({
      __: ['add'],
      count: [10, 20],
    });
  });

  test('should be case-sensitive in strict mode', () => {
    expect(
      argsParser(['add', '-C', '10', '-c', '20'], {
        names: { count: ['c'] },
        strict: true,
      })
    ).toEqual({
      __: ['add'],
      count: 20,
      C: 10,
    });
  });

  test('should be case-insensitive in non-strict mode', () => {
    expect(
      argsParser(['add', '-C', '10', '-c', '20'], {
        names: { count: ['c'] },
        strict: false,
      })
    ).toEqual({
      __: ['add'],
      count: [10, 20],
    });
  });
});

describe('argsParser: Advanced Features', () => {
  test('should handle the --no- prefix as a false boolean', () => {
    expect(argsParser(['--no-cache', '--verbose'])).toEqual({
      __: [],
      cache: false,
      verbose: true,
    });
  });

  test('should treat negative numbers as positional arguments, not flags', () => {
    expect(argsParser(['-10', 'arg2'])).toEqual({
      __: [-10, 'arg2'],
    });
  });

  test('should not have the bug of converting an empty string value to 0', () => {
    expect(argsParser(['--port='])).toEqual({ __: [], port: '' });
    expect(argsParser(['--host', ''])).toEqual({ __: [], host: '' });
  });
});
