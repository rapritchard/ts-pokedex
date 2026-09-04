import { describe, expect, test } from "vitest";
import { Cache } from "../pokecache.js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Cache add/get", () => {
  test.concurrent.each([
    {
      key: "https://example.com",
      val: "testdata",
    },
    {
      key: "https://example.com/path",
      val: "moretestdata",
    },
    {
      key: "https://pokeapi.co/api/v2/location-area/",
      val: { count: 2, results: [{ name: "canalave-city-area" }] },
    },
  ])("caches $key", async ({ key, val }) => {
    const cache = new Cache(1000);

    cache.add(key, val);
    const actual = cache.get(key);

    expect(actual).toEqual(val);

    cache.stopReapLoop();
  });

  test("returns undefined for a key that was never added", () => {
    const cache = new Cache(1000);

    expect(cache.get("https://example.com/missing")).toBeUndefined();

    cache.stopReapLoop();
  });

  test("overwrites the value when the same key is added twice", () => {
    const cache = new Cache(1000);

    cache.add("key", "first");
    cache.add("key", "second");

    expect(cache.get("key")).toBe("second");

    cache.stopReapLoop();
  });
});

describe("Cache reaping", () => {
  test.concurrent.each([
    {
      interval: 50,
      waitTime: 25,
    },
    {
      interval: 100,
      waitTime: 50,
    },
  ])(
    "keeps entries younger than the $interval ms interval",
    async ({ interval, waitTime }) => {
      const cache = new Cache(interval);

      cache.add("key", "val");
      await sleep(waitTime);

      expect(cache.get("key")).toBe("val");

      cache.stopReapLoop();
    },
  );

  test.concurrent.each([
    {
      interval: 50,
      waitTime: 50 * 3,
    },
    {
      interval: 100,
      waitTime: 100 * 3,
    },
  ])(
    "reaps entries older than the $interval ms interval",
    async ({ interval, waitTime }) => {
      const cache = new Cache(interval);

      cache.add("key", "val");
      await sleep(waitTime);

      expect(cache.get("key")).toBeUndefined();

      cache.stopReapLoop();
    },
  );

  test("stopReapLoop prevents further reaping", async () => {
    const cache = new Cache(20);
    cache.stopReapLoop();

    cache.add("key", "val");
    await sleep(20 * 4);

    expect(cache.get("key")).toBe("val");
  });
});
