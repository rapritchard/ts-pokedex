import type { State } from "../state.js";

export async function commandMapB(state: State) {
  const { pokeAPI, prevLocationsURL } = state;

  if (!prevLocationsURL) {
    console.log("you're on the first page");
    return;
  }

  const locations = await pokeAPI.fetchLocations(prevLocationsURL);
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