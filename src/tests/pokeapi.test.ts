import { afterEach, describe, expect, test, vi } from "vitest";
import { PokeAPI, type ShallowLocations } from "../pokeapi.js";

const page: ShallowLocations = {
  count: 2,
  next: "https://pokeapi.co/api/v2/location-area/?offset=20&limit=20",
  previous: undefined,
  results: [
    { name: "canalave-city-area", url: "https://example.com/1" },
    { name: "eterna-city-area", url: "https://example.com/2" },
  ],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockFetch(response: Partial<Response>) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const clients: PokeAPI[] = [];

/**
 * Builds a client whose reap loop is stopped after the test, so a live
 * setInterval never keeps the worker alive.
 */
function makeAPI(cacheInterval = 1000 * 60) {
  const api = new PokeAPI(cacheInterval);
  clients.push(api);
  return api;
}

afterEach(() => {
  for (const client of clients) {
    client.closeCache();
  }
  clients.length = 0;
  vi.unstubAllGlobals();
});

describe("PokeAPI.fetchLocations", () => {
  test("requests the first page when no URL is given", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });

    const actual = await makeAPI().fetchLocations();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/location-area/",
    );
    expect(actual).toEqual(page);
  });

  test("requests the given page URL when one is provided", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });
    const pageURL = "https://pokeapi.co/api/v2/location-area/?offset=20&limit=20";

    await makeAPI().fetchLocations(pageURL);

    expect(fetchMock).toHaveBeenCalledWith(pageURL);
  });

  test("throws when the response is not ok", async () => {
    mockFetch({ ok: false, statusText: "Not Found" });

    await expect(makeAPI().fetchLocations()).rejects.toThrow("Not Found");
  });
});

describe("PokeAPI.fetchLocation", () => {
  test("requests the named location area", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => ({}) });

    await makeAPI().fetchLocation("pastoria-city-area");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/location-area/pastoria-city-area",
    );
  });
});

describe("PokeAPI.fetchPokemon", () => {
  test("requests the named pokemon", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => ({}) });

    await makeAPI().fetchPokemon("pikachu");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon/pikachu",
    );
  });
});

describe("PokeAPI caching", () => {
  test("only fetches a given URL once", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });
    const api = makeAPI();

    const first = await api.fetchLocations();
    const second = await api.fetchLocations();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  test("fetches again for a different URL", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });
    const api = makeAPI();

    await api.fetchLocations();
    await api.fetchLocations(page.next);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("caches each endpoint separately", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => ({}) });
    const api = makeAPI();

    await api.fetchPokemon("pikachu");
    await api.fetchLocation("pikachu");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("does not share a cache between instances", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });

    await makeAPI().fetchLocations();
    await makeAPI().fetchLocations();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("re-fetches once the cache interval has elapsed", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });
    const api = makeAPI(50);

    await api.fetchLocations();
    await sleep(50 * 3);
    await api.fetchLocations();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("PokeAPI.closeCache", () => {
  test("stops the reap loop so entries are no longer expired", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });
    const api = makeAPI(50);

    await api.fetchLocations();
    api.closeCache();
    await sleep(50 * 3);
    await api.fetchLocations();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("is safe to call twice", () => {
    const api = makeAPI();

    api.closeCache();

    expect(() => api.closeCache()).not.toThrow();
  });
});
