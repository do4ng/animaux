/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-exports */
// deno-lint-ignore-file no-explicit-any ban-types

import { showHelp } from './commands/help';
import { argsParser } from './parser';

type ExtractArgs<S extends string> = S extends `${infer _}<${infer Param}> ${infer Rest}`
  ? { [K in Param]: never } & ExtractArgs<Rest>
  : S extends `${infer _}<${infer Param}>`
  ? { [K in Param]: never }
  : S extends `${infer _}[${infer Param}] ${infer Rest}`
  ? { [K in Param]: never } & ExtractArgs<Rest>
  : S extends `${infer _}[${infer Param}]`
  ? { [K in Param]: never }
  : {};

type Merge<T, U> = T & U;

type FlagName<S extends string> = S extends `${infer First},${infer _}`
  ? FlagName<First>
  : S extends `--${infer F}`
  ? F
  : never;

export interface Config {
  name: string;
  version?: string;
}

export function isConfig(config: any): config is Config {
  return typeof config?.name === 'string';
}

class CLI<
  CmdArgs extends Record<string, any> = {},
  OptArgs extends Record<string, any> = {}
> {
  commands: Record<
    string,
    {
      desc?: string;
      action?: (args: { args: CmdArgs; options: OptArgs }) => void;
      args?: Record<string, any>;
      raw?: string;
      options?: Record<
        string,
        { target: string[]; description?: string; defaultValue?: any; raw?: string }
      >;
    }
  > = {};

  config: Config = {} as any;

  options: OptArgs = {
    help: { raw: '--help, -h', target: ['help', 'h'], description: 'Show help' },
    version: {
      raw: '--version, -v',
      target: ['version', 'v'],
      description: 'Show version',
    },
  } as any;

  private globalAction: ((args: { args: CmdArgs; options: OptArgs }) => void) | null =
    null;

  constructor(init?: string | Config) {
    if (typeof init === 'string') {
      this.config = { name: init };
    } else if (isConfig(init)) {
      this.config = init;
    }
  }

  name(name: string) {
    this.config.name = name;
    return this;
  }

  version(version: string) {
    this.config.version = version;
    return this;
  }

  command<N extends string>(name: N): CLI<Merge<CmdArgs, ExtractArgs<N>>, OptArgs> {
    const args = name.split(' ');

    if (args.length === 0) {
      throw new Error('Invalid command name');
    }

    const parsedArgs = args.reduce((acc: Record<string, any>, arg) => {
      if (arg.startsWith('<')) {
        const key = arg.slice(1, -1);
        acc[key] = null;
      } else if (arg.startsWith('[')) {
        const key = arg.slice(1, -1);
        acc[key] = null;
      }
      return acc;
    }, {});

    this.commands[args[0]] = {
      options: {},
      args: parsedArgs,
      raw: name,
    };

    return this as any;
  }

  describe(description: string) {
    const lastCommand = Object.keys(this.commands).pop();
    if (lastCommand) {
      this.commands[lastCommand].desc = description;
    }
    return this;
  }

  option<N extends string>(
    name: N,
    description?: string,
    _defaultValue?: any
  ): CLI<CmdArgs, Merge<OptArgs, Record<FlagName<N>, never>>> {
    const sliced = name
      .split(',')
      .map((s) => s.trim())
      .map((slice) => {
        if (slice.startsWith('--')) {
          return slice.slice(2);
        }
        if (slice.startsWith('-')) return slice.slice(1);
        return slice;
      });
    const lastCommand = Object.keys(this.commands).pop();

    if (lastCommand) {
      this.commands[lastCommand].options = {
        ...this.commands[lastCommand].options,
        [sliced[0]]: {
          raw: name,
          target: sliced,
          description,
          defaultValue: _defaultValue ?? null,
        },
      };
    } else {
      this.options = {
        ...this.options,
        [sliced[0]]: {
          raw: name,
          target: sliced,
          description,
          defaultValue: _defaultValue ?? null,
        },
      };
    }
    return this as any;
  }

  action(callback: (args: { args: CmdArgs; options: OptArgs }) => void) {
    const lastCommand = Object.keys(this.commands).pop();
    if (lastCommand) {
      this.commands[lastCommand].action = callback;
    } else {
      this.globalAction = callback;
    }
    return this;
  }

  private concatOptions() {
    const names: Record<string, string[]> = {};

    for (const [optionName, option] of Object.entries(this.options)) {
      names[optionName] = option.target;
    }

    for (const [, command] of Object.entries(this.commands)) {
      for (const [optionName, option] of Object.entries(command.options || {})) {
        names[optionName] = option.target;
      }
    }

    return names;
  }

  private findDefaultValue() {
    const names: Record<string, string[]> = {};

    for (const [optionName, option] of Object.entries(this.options)) {
      if (option.defaultValue) {
        names[optionName] = option.defaultValue;
      }
    }

    for (const [, command] of Object.entries(this.commands)) {
      for (const [optionName, option] of Object.entries(command.options || {})) {
        if (option.defaultValue) {
          names[optionName] = option.defaultValue;
        }
      }
    }

    return names;
  }

  parse(argv: string[]) {
    const args = {
      ...(this.findDefaultValue() as any),
      ...argsParser(argv, {
        names: this.concatOptions(),
        strict: false,
      }),
    };

    const cmd: string = args.__[0] || '';
    let command: any = {};

    // --help, -h, --version, -v

    if (args.help) {
      showHelp(this as any, cmd);

      return;
    }
    if (args.version) {
      console.log(`${this.config.name} ${this.config.version}`);
      return;
    }

    for (const [name, commandPrompt] of Object.entries(this.commands)) {
      if (cmd === name) {
        command = commandPrompt;
        break;
      }
    }

    // console.log(command, cmd.trim());

    // assign arguments

    const inputArgs = args.__.slice(1);
    const commandArguments: Record<any, any> = {};

    for (const [key] of Object.entries(command.args || {})) {
      if (Object.keys(commandArguments).length === Object.keys(command.args).length - 1) {
        commandArguments[key] = inputArgs.join(' ');
        break;
      }

      commandArguments[key] = inputArgs.shift();
    }

    if (command.action) {
      command.action({
        args: commandArguments as any,
        options: args as any,
      });
    } else if (this.globalAction) {
      this.globalAction({
        args: commandArguments as any,
        options: args as any,
      });
    }
  }
}

export function program(init: Config | string) {
  return new CLI(init);
}

export { CLI, showHelp, program as default, argsParser };
