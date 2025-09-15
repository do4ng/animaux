import 'colors';
import { CLI } from '../index';

interface Option {
  description: string;
  defaultValue?: string;
  raw: string;
}

export function showHelp(app: CLI, command: string) {
  console.log();
  const $ = '$'.gray;

  const _command = command;

  if (command) {
    const cmd = app.commands[command];

    if (!cmd) {
      console.log(`Command ${command.bold} not found`.red);
      return;
    }

    console.log('Usage'.bold);
    console.log(`  ${$} ${app.config.name} ${cmd.raw}`);
    console.log();

    console.log(cmd.desc || '');
    console.log();

    console.log('Options (global)'.bold);

    for (const [, option] of Object.entries(app.options as Record<string, Option>)) {
      console.log(
        `  ${option.raw.padEnd(20)} ${
          (option.description || 'No description provided.').gray
        }${option.defaultValue ? `  (default: ${option.defaultValue})`.cyan : ''}`
      );
    }
    console.log('\nOptions (scoped)'.bold);
    for (const [, command] of Object.entries(app.commands)) {
      // find options

      // eslint-disable-next-line no-continue
      if (_command.trim() !== command.raw.split(' ')[0]) continue;

      for (const [, option] of Object.entries(command.options || {})) {
        console.log(
          `  ${(option as Option).raw.padEnd(20)} ${
            (option.description || 'No description provided.').gray
          }${option.defaultValue ? `  (default: ${option.defaultValue})`.cyan : ''}`
        );
      }
    }
    console.log();
  } else {
    console.log('Usage'.bold);
    console.log(`  ${$} ${app.config.name} [command] [options]`);
    console.log();

    console.log('Commands'.bold);
    for (const [commandName, command] of Object.entries(app.commands)) {
      console.log(`  ${commandName.padEnd(20)} ${(command.desc || '').gray}`);
    }
    console.log();

    console.log('Options (global)'.bold);
    for (const [, option] of Object.entries(app.options as Record<string, Option>)) {
      console.log(
        `  ${option.raw.padEnd(20)} ${
          (option.description || 'No description provided.').gray
        }${option.defaultValue ? `  (default: ${option.defaultValue})`.cyan : ''}`
      );
    }
    console.log();

    console.log("Run '<command> --help' for more information on a command.");
  }
}
