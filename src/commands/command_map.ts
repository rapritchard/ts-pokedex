import type { State } from "../state.js";

export async function commandMap(state: State) {
  const { pokeAPI, nextLocationsURL } = state;

  const locations = await pokeAPI.fetchLocations(nextLocationsURL);
  if (locations.next) {
    state.nextLocationsURL = locations.next;
  }

  if (locations.previous) {
    state.prevLocationsURL = locations.previous;
  }

  for (const location of locations.results) {
    console.log(location.name);
  }
};