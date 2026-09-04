import { createInterface } from 'node:readline';
import { getCommands } from './commands/command.js';
import type { State } from './state.js';

export function startREPL(state: State) {

  state.readline.prompt();
  state.readline.on("line", (line) => {
    const cleanedInput = cleanInput(line)[0];
    if (!cleanedInput.length) {
      state.readline.prompt();
    } 

    const command = state.commands[cleanedInput];
    if (command) {
      try {
        command.callback(state);
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Unknown command")
    }
    state.readline.prompt();
  })
};

/**
 * Cleans the user input by splitting and lowercasing.
 * @param input the user input to clean
 * @returns An array of strings split on whitespace and converted to lowercase
 */
export function cleanInput(input: string): string[] {
  return input.trim().toLowerCase().split(/\s+/).filter((word) => word !== "");
};