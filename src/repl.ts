import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';
import { getCommands } from './commands/command.js';

export function startREPL() {
  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: "Pokedex > "
  });
  const commands = getCommands()

  rl.prompt();
  rl.on("line", (line) => {
    const cleanedInput = cleanInput(line)[0];
    if (!cleanedInput.length) {
      rl.prompt();
    } 

    const command = commands[cleanedInput];
    if (command) {
      try {
        command.callback(commands);
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Unknown command")
    }
    rl.prompt();
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