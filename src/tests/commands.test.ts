import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { commandHelp } from "../commands/command_help.js";
import { commandMap } from "../commands/command_map.js";
import { commandMapB } from "../commands/command_mapb.js";
import type { ShallowLocations } from "../pokeapi.js";
import type { State } from "../state.js";

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
    pokeAPI: { fetchLocations: vi.fn().mockResolvedValue(page) } as unknown as State["pokeAPI"],
    nextLocationsURL: undefined,
    prevLocationsURL: undefined,
    ...overrides,
  };
}

let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function loggedLines() {
  return logSpy.mock.calls.map((call) => String(call[0] ?? ""));
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
