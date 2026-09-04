import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { commandCatch } from "../commands/command_catch.js";
import { commandExplore } from "../commands/command_explore.js";
import { commandHelp } from "../commands/command_help.js";
import { commandMap } from "../commands/command_map.js";
import { commandMapB } from "../commands/command_mapb.js";
import type { Location, Pokemon, ShallowLocations } from "../pokeapi.js";
import type { CLICommand, State } from "../state.js";

const page: ShallowLocations = {
  count: 2,
  next: "https://pokeapi.co/api/v2/location-area/?offset=40&limit=20",
  previous: "https://pokeapi.co/api/v2/location-area/?offset=0&limit=20",
  results: [
    { name: "canalave-city-area", url: "https://example.com/1" },
    { name: "eterna-city-area", url: "https://example.com/2" },
  ],
};

/**
 * Only the fields commandExplore reads; the rest of Location is irrelevant here.
 */
function makeArea(pokemonNames: string[]): Location {
  return {
    name: "pastoria-city-area",
    pokemon_encounters: pokemonNames.map((name) => ({
      pokemon: { name, url: `https://example.com/${name}` },
    })),
  } as unknown as Location;
}

const area = makeArea(["tentacool", "magikarp"]);

/**
 * Only the fields commandCatch reads; base_experience drives the catch odds.
 */
function makePokemon(name: string, baseExperience: number): Pokemon {
  return { name, base_experience: baseExperience } as unknown as Pokemon;
}

const pikachu = makePokemon("pikachu", 112);

/**
 * Builds a State with a stubbed PokeAPI and readline, so commands can be
 * exercised without hitting the network or stdin.
 */
function fakeState(overrides: Partial<State> = {}): State {
  return {
    readline: {} as State["readline"],
    commands: {
      help: {
        name: "help",
        description: "Displays a help message",
        callback: commandHelp,
      },
    },
    pokeAPI: {
      fetchLocations: vi.fn().mockResolvedValue(page),
      fetchLocation: vi.fn().mockResolvedValue(area),
      fetchPokemon: vi.fn().mockResolvedValue(pikachu),
    } as unknown as State["pokeAPI"],
    pokeDex: {},
    nextLocationsURL: undefined,
    prevLocationsURL: undefined,
    ...overrides,
  };
}

const logs: string[] = [];

beforeEach(() => {
  logs.length = 0;
  vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    logs.push(String(args[0] ?? ""));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function loggedLines() {
  return logs;
}

describe("commandHelp", () => {
  test("prints every registered command", async () => {
    const state = fakeState();

    await commandHelp(state);

    expect(loggedLines()).toContain("help: Displays a help message");
  });
});

describe("commandMap", () => {
  test("prints location names and stores the pagination URLs", async () => {
    const state = fakeState();

    await commandMap(state);

    expect(state.pokeAPI.fetchLocations).toHaveBeenCalledWith(undefined);
    expect(loggedLines()).toEqual(["canalave-city-area", "eterna-city-area"]);
    expect(state.nextLocationsURL).toBe(page.next);
    expect(state.prevLocationsURL).toBe(page.previous);
  });

  test("follows nextLocationsURL on subsequent calls", async () => {
    const state = fakeState({ nextLocationsURL: "https://example.com/next" });

    await commandMap(state);

    expect(state.pokeAPI.fetchLocations).toHaveBeenCalledWith(
      "https://example.com/next",
    );
  });
});

describe("commandExplore", () => {
  test("prints the encounters for the given area", async () => {
    const state = fakeState();

    await commandExplore(state, "pastoria-city-area");

    expect(state.pokeAPI.fetchLocation).toHaveBeenCalledWith(
      "pastoria-city-area",
    );
    expect(loggedLines()).toEqual([
      "Exploring pastoria-city-area...",
      "Found Pokemon:",
      " - tentacool",
      " - magikarp",
    ]);
  });

  test("reports when an area has no encounters", async () => {
    const state = fakeState();
    vi.mocked(state.pokeAPI.fetchLocation).mockResolvedValue(makeArea([]));

    await commandExplore(state, "empty-area");

    expect(loggedLines()).toContain("No Pokemon found in empty-area");
  });

  test("asks for an area name when called without one", async () => {
    const state = fakeState();
    // the REPL invokes callbacks with no extra args when none were typed
    const callback: CLICommand["callback"] = commandExplore;

    await callback(state);

    expect(state.pokeAPI.fetchLocation).not.toHaveBeenCalled();
    expect(loggedLines()).toEqual([
      "Please provide an area name to explore",
    ]);
  });

  test("propagates a failed lookup so the REPL can report it", async () => {
    const state = fakeState();
    vi.mocked(state.pokeAPI.fetchLocation).mockRejectedValue(
      new Error("Not Found"),
    );

    await expect(commandExplore(state, "nowhere")).rejects.toThrow("Not Found");
  });
});

describe("commandCatch", () => {
  // pikachu's base_experience of 112 gives a catch threshold of 50/112 ≈ 0.446
  function stubRandom(value: number) {
    vi.spyOn(Math, "random").mockReturnValue(value);
  }

  test("adds the Pokemon to the pokedex on a successful roll", async () => {
    const state = fakeState();
    stubRandom(0.4);

    await commandCatch(state, "pikachu");

    expect(state.pokeAPI.fetchPokemon).toHaveBeenCalledWith("pikachu");
    expect(loggedLines()).toEqual([
      "Throwing a Pokeball at pikachu...",
      "pikachu was caught!",
    ]);
    expect(state.pokeDex["pikachu"]).toBe(pikachu);
  });

  test("leaves the pokedex untouched when the Pokemon escapes", async () => {
    const state = fakeState();
    stubRandom(0.6);

    await commandCatch(state, "pikachu");

    expect(loggedLines()).toEqual([
      "Throwing a Pokeball at pikachu...",
      "pikachu escaped!",
    ]);
    expect(state.pokeDex).toEqual({});
  });

  test("always catches a Pokemon whose base experience is below the threshold", async () => {
    const state = fakeState();
    vi.mocked(state.pokeAPI.fetchPokemon).mockResolvedValue(
      makePokemon("caterpie", 39),
    );
    // 50/39 clamps to a threshold of 1, so even the worst roll succeeds
    stubRandom(0.99);

    await commandCatch(state, "caterpie");

    expect(state.pokeDex["caterpie"]).toBeDefined();
  });

  test("asks for a Pokemon when called without one", async () => {
    const state = fakeState();
    const callback: CLICommand["callback"] = commandCatch;

    await callback(state);

    expect(state.pokeAPI.fetchPokemon).not.toHaveBeenCalled();
    expect(loggedLines()).toEqual([
      "Please provide a Pokemon to try and catch",
    ]);
  });

  test("propagates a failed lookup so the REPL can report it", async () => {
    const state = fakeState();
    vi.mocked(state.pokeAPI.fetchPokemon).mockRejectedValue(
      new Error("Not Found"),
    );

    await expect(commandCatch(state, "missingno")).rejects.toThrow("Not Found");
  });
});

describe("commandMapB", () => {
  test("warns and does not fetch when there is no previous page", async () => {
    const state = fakeState();

    await commandMapB(state);

    expect(state.pokeAPI.fetchLocations).not.toHaveBeenCalled();
    expect(loggedLines()).toEqual(["you're on the first page"]);
  });

  test("fetches the previous page and updates the URLs", async () => {
    const state = fakeState({ prevLocationsURL: "https://example.com/prev" });

    await commandMapB(state);

    expect(state.pokeAPI.fetchLocations).toHaveBeenCalledWith(
      "https://example.com/prev",
    );
    expect(loggedLines()).toEqual(["canalave-city-area", "eterna-city-area"]);
    expect(state.nextLocationsURL).toBe(page.next);
    expect(state.prevLocationsURL).toBe(page.previous);
  });
});
