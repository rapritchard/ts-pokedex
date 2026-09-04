import type { State } from "../state.js";

export async function commandExit(state: State) {
  console.log("\nClosing the Pokedex... Goodbye!");
  state.readline.close();
  state.pokeAPI.closeCache();
  process.exit(0);
};