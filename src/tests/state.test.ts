import { afterEach, describe, expect, test } from "vitest";
import { PokeAPI } from "../pokeapi.js";
import { initState, type State } from "../state.js";

let state: State | undefined;

afterEach(() => {
  state?.readline.close();
  state?.pokeAPI.closeCache();
  state = undefined;
});

describe("initState", () => {
  test("wires up readline, the commands and the API client", () => {
    state = initState();

    expect(state.readline).toBeDefined();
    expect(state.pokeAPI).toBeInstanceOf(PokeAPI);
    expect(Object.keys(state.commands)).toContain("help");
    expect(state.pokeDex).toEqual({});
    expect(state.nextLocationsURL).toBeUndefined();
    expect(state.prevLocationsURL).toBeUndefined();
  });
});
