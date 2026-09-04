import type { State } from "../state.js";

export async function commandMapB(state: State) {
  const { pokeAPI, prevLocationsURL } = state;

  if (!prevLocationsURL) {
    console.log("you're on the first page");
    return;
  }

  const locations = await pokeAPI.fetchLocations(prevLocationsURL);
  state.nextLocationsURL = locations.next;
  state.prevLocationsURL = locations.previous;
  

  for (const location of locations.results) {
    console.log(location.name);
  }
};