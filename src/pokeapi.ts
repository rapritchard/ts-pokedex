import { Cache } from "./pokecache.js";

export class PokeAPI {
  private static readonly baseURL = "https://pokeapi.co/api/v2";
  #cache: Cache = new Cache(60 * 5);

  constructor() {}

  #checkCache(key: string) {
    return this.#cache.get(key);
  };

  #updateCache<T>(key: string, val: T) {
    this.#cache.add(key, val)
  };

  async fetchLocations(pageURL?: string): Promise<ShallowLocations> {
    const url = pageURL ?? `${PokeAPI.baseURL}/location-area/`;
    const cachedData = this.#checkCache(url);
    
    if (cachedData) {
      return cachedData;
    }

    const response = await fetch(pageURL ?? `${PokeAPI.baseURL}/location-area/`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    
    this.#updateCache(url, data)
    return data;
  }

  async fetchLocation(locationName: string): Promise<Location> {
    const url = `${PokeAPI.baseURL}/location-area/${locationName}`;

    const cachedData = this.#checkCache(url);
    
    if (cachedData) {
      return cachedData;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    
    this.#updateCache(url, data)
    return data;
  }
}

export type ShallowLocations = {
  count: number;
  next: string;
  previous: any;
  results: {
    name: string;
    url: string;
  }[];
};

export type Location = {
  id: number
  name: string
  game_index: number
  encounter_method_rates: Array<{
    encounter_method: {
      name: string
      url: string
    }
    version_details: Array<{
      rate: number
      version: {
        name: string
        url: string
      }
    }>
  }>
  location: {
    name: string
    url: string
  }
  names: Array<{
    name: string
    language: {
      name: string
      url: string
    }
  }>
  pokemon_encounters: Array<{
    pokemon: {
      name: string
      url: string
    }
    version_details: Array<{
      version: {
        name: string
        url: string
      }
      max_chance: number
      encounter_details: Array<{
        min_level: number
        max_level: number
        chance: number
        method: {
          name: string
          url: string
        }
        condition_values: Array<any>
        pokemon_details: any
      }>
    }>
  }>
};