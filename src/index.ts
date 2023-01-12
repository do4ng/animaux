import 'colors';

import { argsParser } from './parser';

export interface Options {
  strict?: boolean;
}

class Program {
  __name: string;

  __version: string;

  __cfg: Options;

  __options: Record<string, string[]>;

  __optionsDetails: Record<string, { des: string; default?: any; raw: string }>;

  __optionsDefault: Record<string, any>;

  private currentCommand: string;

  private commands: {
    command: string;
    args: string[];
    des: string;
    default: any;
    alias: string[];
    action: Function;
  }[];

  constructor(name: string, opts?: Options) {
    this.__name = name;
    this.__cfg = opts || {};
    this.commands = [
      {
        command: '__default',
        args: [],
        des: null,
        default: null,
        action: null,
        alias: [],
      },
    ];
    this.__options = {
      help: ['help', 'h'],
      version: ['version', 'v'],
    };
    this.__optionsDetails = {
      help: { des: 'Displays help information.', raw: '--help, -h' },
      version: { des: 'Displays current version.', raw: '--version, -v' },
    };
    this.__optionsDefault = {};
  }

  name(name: string) {
    this.__name = name;

    return this;
  }

  version(version: string) {
    this.__version = version;

    return this;
  }

  option(opt: string, description: string, defaultValue: any = undefined) {
    const sliced = opt
      .split(',')
      .map((s) => s.trim())
      .map((slice) => {
        if (slice.startsWith('--')) {
          return slice.slice(2);
        }
        if (slice.startsWith('-')) return slice.slice(1);
        return slice;
      });

    this.__options[sliced[0]] = sliced;
    this.__optionsDetails[sliced[0]] = {
      des: description,
      default: defaultValue,
      raw: opt,
    };
    this.__optionsDefault[sliced[0]] = defaultValue;

    return this;
  }

  command(cmd: string, alias?: string[]) {
    // parse

    const sliced = cmd.split(' ');
    const $ = {
      command: sliced[0],
      args: sliced.slice(1),
      des: '',
      default: cmd,
      action: null,
      alias: alias || [],
    };

    $.args = $.args.map((arg) => {
      if (!(arg.startsWith('<') && arg.endsWith('>'))) {
        console.error(`Parsing Error - ${arg}`);

        process.exit(1);
      }
      return arg.slice(1, -1);
    });

    this.currentCommand = $.command;
    this.commands.push($);

    return this;
  }

  describe(des: string) {
    const c = this.commands.filter((cmd) => cmd.command === this.currentCommand)[0] || 0;

    // default
    if (c === 0) {
      this.commands[0].des = des;
    } else {
      c.des = des;
    }

    return this;
  }

  action(action: Function) {
    const c = this.commands.filter((cmd) => cmd.command === this.currentCommand)[0] || 0;

    // default
    if (c === 0) {
      this.commands[0].action = action;
    } else {
      c.action = action;
    }

    return this;
  }

  showHelp(command?: string) {
    const $ = '$'.gray;
    if (!command) {
      let maxCommand = 0;
      this.commands.forEach((command) => {
        if (command.command.length > maxCommand) {
          maxCommand = command.command.length;
        }
      });
      let maxOption = 0;
      Object.keys(this.__options).forEach((opt) => {
        const t = this.__optionsDetails[opt].raw;
        if (t.length > maxOption) maxOption = t.length;
      });

      console.log();
      console.log('  Usage'.bold);
      console.log(`    ${$} ${this.__name} <command> [options]`);

      console.log();
      console.log('  Commands'.bold);
      this.commands.forEach((command) => {
        if (command.command !== '__default') {
          console.log(
            `    ${command.command}    ${' '.repeat(
              maxCommand - command.command.length
            )}${(command.des || '').gray}`
          );
        }
      });

      console.log();
      console.log('  Options'.bold);
      Object.keys(this.__options).forEach((opt) => {
        console.log(
          `    ${this.__optionsDetails[opt].raw}    ${' '.repeat(
            maxOption - this.__optionsDetails[opt].raw.length
          )}${(this.__optionsDetails[opt].des || '').gray}${
            this.__optionsDetails[opt].default
              ? ` (default ${this.__optionsDetails[opt].default})`.cyan
              : ''
          }`
        );
      });

      console.log();
      console.log(`  Run \`${this.__name} <command> --help\` for more information.`);
    } else {
      let maxOption = 0;
      Object.keys(this.__options).forEach((opt) => {
        const t = this.__optionsDetails[opt].raw;
        if (t.length > maxOption) maxOption = t.length;
      });

      const c = this.commands.filter((cmd) => cmd.command === command)[0];

      if (!c) return this;

      console.log();
      console.log('  Usage'.bold);
      console.log(`    ${$} ${this.__name} ${c.default}`);

      console.log();
      console.log(`  ${c.des || 'no description'.gray}`);

      if (c.alias.length !== 0) {
        console.log();
        console.log('  Alias'.bold);
        c.alias.forEach((id) => {
          console.log(`    ${$} ${this.__name} ${id}`);
        });
        console.log(`    ${$} ${this.__name} ${c.command}`);
      }

      console.log();
      console.log('  Options'.bold);
      Object.keys(this.__options).forEach((opt) => {
        console.log(
          `    ${this.__optionsDetails[opt].raw}    ${' '.repeat(
            maxOption - this.__optionsDetails[opt].raw.length
          )}${(this.__optionsDetails[opt].des || '').gray}${
            this.__optionsDetails[opt].default
              ? ` (default ${this.__optionsDetails[opt].default})`.cyan
              : ''
          }`
        );
      });
    }
    console.log();
  }

  showVersion() {
    console.log(`${'$'.gray} ${`v${this.__version}`}`);
  }

  parse(args: string[]) {
    const parsed = argsParser(args.slice(2), {
      names: { ...this.__options, help: 'h', version: 'v' },
      strict: this.__cfg.strict || true,
    });

    let cmd = parsed.__[0] || '';

    const c =
      this.commands.filter((f) => {
        if (f.command === cmd) return true;
        if (f.alias.includes(cmd.trim())) {
          cmd = f.command;
          return true;
        }
        return false;
      })[0] || 0;

    if (parsed.help === true) {
      this.showHelp(cmd);

      return this;
    }
    if (parsed.version === true) {
      this.showVersion();

      return this;
    }
    // eslint-disable-next-line no-unused-expressions
    if (c === 0) this.commands[0].action && this.commands[0].action();
    else {
      const giveArgs = parsed.__.slice(1);
      const options = { ...this.__optionsDefault, ...parsed };
      c.action(...giveArgs, options);
    }

    return this;
  }
}

function cli(name: string) {
  return new Program(name);
}

cli.Program = Program;
cli.parser = argsParser;

export default cli;
