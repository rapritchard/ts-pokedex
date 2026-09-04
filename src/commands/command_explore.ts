import type { State } from "../state.js";

export async function commandExplore(state: State, areaName: string) {
  if (!areaName) {
    console.log("Please provide an area name to explore");
    return;
  }

  const { pokeAPI } = state;

  console.log(`Exploring ${areaName}...`);
  const area = await pokeAPI.fetchLocation(areaName);
  
  if (area.pokemon_encounters.length) {
    console.log('Found Pokemon:');
    for (const encounter of area.pokemon_encounters) {
      console.log(` - ${encounter.pokemon.name}`);
    }
  } else {
    console.log(`No Pokemon found in ${areaName}`);
  }
};