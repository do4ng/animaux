/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-restricted-globals */
/* eslint-disable prefer-destructuring */

export interface ParserOptions {
  names?: Record<string, string | string[]>;
  strict?: boolean;
}

export function argsParser(args: string[], opts: ParserOptions = {}) {
  const $ = {
    current: null,
  };
  const result: Record<string, any> = {
    __: [],
  };

  const push = (target: string, data: any) => {
    if (!target) return;
    target =
      Object.keys(opts.names || {}).filter((name) => {
        if (opts.strict) {
          return (
            opts.names[name] === target ||
            (Array.isArray(opts.names[name]) && opts.names[name].includes(target))
          );
        }
        return (
          (Array.isArray(opts.names[name]) &&
            (opts.names[name] as string[])
              .map((c) => c.toLowerCase())
              .includes(target.toLowerCase())) ||
          (typeof opts.names[name] === 'string' &&
            (opts.names[name] as string).toLowerCase() === target.toLowerCase())
        );
      })[0] || target;

    if (!result[target]) result[target] = null;
    else if (!Array.isArray(result[target])) result[target] = [result[target]];

    const set = (d: any) => {
      if (Array.isArray(result[target])) result[target].push(d);
      else result[target] = d;
    };

    if (typeof data === 'string') {
      if (!isNaN(data as any)) {
        // number
        set(Number(data));
      } else if (data === 'true') {
        // boolean(true)
        set(true);
      } else if (data === 'false') {
        // boolean(false)
        set(false);
      } else {
        // string
        set(data);
      }
    } else {
      set(data);
    }
  };

  args.forEach((arg) => {
    // --out
    if (arg.startsWith('--')) {
      if (arg === '--') {
        $.current = null;
      } else {
        const sliced = arg.slice(2).split('=');

        if (sliced.length === 1) {
          $.current = sliced[0];
        } else {
          push(sliced[0], sliced[1]);
        }
      }
    } else if (arg.startsWith('-')) {
      for (let i = 1; i < arg.length - 1; i += 1) {
        $.current = arg[i];
        push($.current, true);
      }
      $.current = arg[arg.length - 1];
    } else if ($.current) {
      push($.current, arg);
      $.current = null;
    } else if (arg !== '') {
      push('__', arg);
    }
  });

  if ($.current) {
    push($.current, true);
  }

  return result;
}
