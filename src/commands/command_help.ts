import type { State } from "../state.js";

export async function commandHelp(state: State) {
  const { commands } = state;
  console.log("\nWelcome to the Pokedex!");
  console.log("Usage:\n");

   for (const cmd of Object.values(commands)) {
    console.log(`${cmd.name}: ${cmd.description}`);
  }
  console.log()
};