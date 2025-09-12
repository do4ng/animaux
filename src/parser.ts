/* eslint-disable no-restricted-globals */
export interface ParserOptions {
  names?: Record<string, string | string[]>;
  strict?: boolean;
}

export function argsParser(args: string[], opts: ParserOptions = {}) {
  const parserState = {
    currentFlag: null as string | null,
  };
  const result: Record<string, any> = {
    __: [],
  };

  const findAlias = (target: string): string => {
    if (!opts.names) return target;

    for (const name in opts.names) {
      if (Object.prototype.hasOwnProperty.call(opts.names, name)) {
        const aliases = opts.names[name];
        if (Array.isArray(aliases)) {
          if (opts.strict) {
            if (aliases.includes(target)) {
              return name;
            }
          } else if (aliases.map((a) => a.toLowerCase()).includes(target.toLowerCase())) {
            return name;
          }
        } else if (typeof aliases === 'string') {
          if (opts.strict) {
            if (aliases === target) {
              return name;
            }
          } else if (aliases.toLowerCase() === target.toLowerCase()) {
            return name;
          }
        }
      }
    }
    return target;
  };

  const push = (key: string, value: any) => {
    if (!key) return;

    const targetKey = findAlias(key);

    let processedValue = value;
    if (typeof value === 'string') {
      if (value.trim() !== '' && !isNaN(value as any)) {
        processedValue = Number(value);
      } else if (value.toLowerCase() === 'true') {
        processedValue = true;
      } else if (value.toLowerCase() === 'false') {
        processedValue = false;
      }
    }

    if (result[targetKey] === undefined || result[targetKey] === null) {
      result[targetKey] = processedValue;
    } else {
      if (!Array.isArray(result[targetKey])) {
        result[targetKey] = [result[targetKey]];
      }
      result[targetKey].push(processedValue);
    }
  };

  args.forEach((arg) => {
    if (arg === '--') {
      parserState.currentFlag = '__';
      return;
    }
    if (parserState.currentFlag === '__') {
      push('__', arg);
      return;
    }

    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=', 2);

      if (key.startsWith('no-')) {
        push(key.slice(3), false);
        parserState.currentFlag = null;
      } else if (value !== undefined) {
        push(key, value);
        parserState.currentFlag = null;
      } else {
        parserState.currentFlag = key;
      }
    } else if (arg.startsWith('-') && isNaN(Number(arg))) {
      const flags = arg.slice(1);

      for (let i = 0; i < flags.length - 1; i += 1) {
        push(flags[i], true);
      }
      parserState.currentFlag = flags[flags.length - 1];
    } else if (parserState.currentFlag) {
      push(parserState.currentFlag, arg);
      parserState.currentFlag = null;
    } else if (arg !== '') {
      push('__', arg);
    }
  });

  if (parserState.currentFlag && parserState.currentFlag !== '__') {
    push(parserState.currentFlag, true);
  }

  return result;
}
