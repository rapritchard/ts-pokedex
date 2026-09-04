import { stdin, stdout } from 'node:process';
import { createInterface, type Interface } from "readline";
import { getCommands } from './commands/command.js';

export type State = {
  readline: Interface;
  commands: Record<string, CLICommand>
}

export type CLICommand = {
  name: string;
  description: string;
  callback: (state: State) => void;
};

export function initState(): State {
const readline = createInterface({
    input: stdin,
    output: stdout,
    prompt: "Pokedex > "
  });
  
  return {
    readline,
    commands: getCommands()
  }
}