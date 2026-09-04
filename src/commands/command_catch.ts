import type { State } from "../state.js";

// Benchmark based on the highest standard base_experience in the API (Blissey)
const MAX_BASE_XP = 608;

export async function commandCatch(state: State, pokemonName: string) {
  if (!pokemonName) {
    console.log("Please provide a Pokemon to try and catch");
    return;
  }

  const { pokeAPI } = state;

  const pokemon = await pokeAPI.fetchPokemon(pokemonName)
  console.log(`Throwing a Pokeball at ${pokemon.name}...`);

  const successThreshold = Math.min(1, 50 / pokemon.base_experience); 
  if (Math.random() > successThreshold) {
    console.log(`${pokemon.name} escaped!`);
    return;
  } else {

  }
  console.log(`${pokemon.name} was caught!`)
  state.pokeDex[pokemon.name] = pokemon;
  
};