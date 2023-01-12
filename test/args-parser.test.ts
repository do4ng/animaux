import { argsParser } from '../src/parser';

test('args parser', () => {
  expect(argsParser(['install'])).toEqual({ __: ['install'] });

  expect(argsParser(['install', 'awesome-app', '--hello=world', ''])).toEqual({
    __: ['install', 'awesome-app'],
    hello: 'world',
  });

  expect(argsParser(['build', 'index.ts', '-O', 'out.js'])).toEqual({
    __: ['build', 'index.ts'],
    O: 'out.js',
  });

  expect(argsParser(['-abcd', '10'])).toEqual({
    __: [],
    a: true,
    b: true,
    c: true,
    d: 10,
  });

  expect(
    argsParser(['build', 'index.ts', '-O', 'out.js', '--config', 'config.json'])
  ).toEqual({
    __: ['build', 'index.ts'],
    O: 'out.js',
    config: 'config.json',
  });

  // alias

  expect(
    argsParser(['build', 'index.ts', '-O', 'out.js', '-c', 'config.json'], {
      names: { config: 'c', output: ['O', 'o'] },
    })
  ).toEqual({
    __: ['build', 'index.ts'],
    output: 'out.js',
    config: 'config.json',
  });

  // array

  expect(
    argsParser(['add', '-c', '10', '-c', '20'], {
      names: { count: ['c'] },
    })
  ).toEqual({
    __: ['add'],
    count: [10, 20],
  });

  // strict
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
  // no-strict
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
