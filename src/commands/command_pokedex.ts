import type { State } from "../state.js";

export async function commandPokedex(state: State) {

  const { pokeDex } = state;
  if (!Object.keys(pokeDex).length) {
    console.log("The Pokedex is empty...");
    return;
  }

  console.log("Your Pokedex:")
  for (const pokemon of Object.values(pokeDex)) {
    console.log(` - ${pokemon.name}`);
  }
};