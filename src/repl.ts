import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';

export function startREPL() {
  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: "Pokedex > "
  });

  rl.prompt();
  rl.on("line", (line) => {
    const cleanedInput = cleanInput(line);
    if (!cleanedInput.length) {
      rl.prompt();
    }
    console.log(`Your command was: ${cleanedInput[0]}`);
    rl.prompt();
  })
}

/**
 * Cleans the user input by splitting and lowercasing.
 * @param input the user input to clean
 * @returns An array of strings split on whitespace and converted to lowercase
 */
export function cleanInput(input: string): string[] {
  return input.trim().toLowerCase().split(/\s+/).filter((word) => word !== "");
}