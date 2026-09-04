import type { State } from "../state.js";

export async function commandInspect(state: State, pokemonName: string) {
  if (!pokemonName) {
    console.log("Please provide a Pokemon to inspect");
    return;
  }

  const { pokeDex } = state;
  if (pokemonName in pokeDex) {
    const pokemon = pokeDex[pokemonName];
    console.log(`Name: ${pokemon.name}`);
    console.log(`Height: ${pokemon.height}`);
    console.log(`Weight: ${pokemon.weight}`);

    console.log("Stats:");
    for (const s of pokemon.stats) {
      console.log(` -${s.stat.name}: ${s.base_stat}`);
    }

    console.log("Types:");
    for (const t of pokemon.types) {
      console.log(` - ${t.type.name}`);
    }
  } else {
    console.log(`You need to catch a ${pokemonName} first!`);
  } 
};