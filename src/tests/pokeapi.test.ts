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

function mockFetch(response: Partial<Response>) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PokeAPI.fetchLocations", () => {
  test("requests the first page when no URL is given", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });

    const actual = await new PokeAPI().fetchLocations();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/location-area/",
    );
    expect(actual).toEqual(page);
  });

  test("requests the given page URL when one is provided", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });
    const pageURL = "https://pokeapi.co/api/v2/location-area/?offset=20&limit=20";

    await new PokeAPI().fetchLocations(pageURL);

    expect(fetchMock).toHaveBeenCalledWith(pageURL);
  });

  test("throws when the response is not ok", async () => {
    mockFetch({ ok: false, statusText: "Not Found" });

    await expect(new PokeAPI().fetchLocations()).rejects.toThrow("Not Found");
  });
});

describe("PokeAPI caching", () => {
  test("only fetches a given URL once", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });
    const api = new PokeAPI();

    const first = await api.fetchLocations();
    const second = await api.fetchLocations();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  test("fetches again for a different URL", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });
    const api = new PokeAPI();

    await api.fetchLocations();
    await api.fetchLocations(page.next);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("does not share a cache between instances", async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => page });

    await new PokeAPI().fetchLocations();
    await new PokeAPI().fetchLocations();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
