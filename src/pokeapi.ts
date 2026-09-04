import { Cache } from "./pokecache.js";

export class PokeAPI {
  private static readonly baseURL = "https://pokeapi.co/api/v2";
  #cache: Cache = new Cache(60 * 5);

  constructor() {}

  async fetchLocations(pageURL?: string): Promise<ShallowLocations> {
    const url = pageURL ?? `${PokeAPI.baseURL}/location-area/`;
    const cachedData = this.#cache.get(url);
    
    if (cachedData) {
      return cachedData;
    }

    const response = await fetch(pageURL ?? `${PokeAPI.baseURL}/location-area/`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    
    this.#cache.add(url, data)
    return data;
  }

  // async fetchLocation(locationName: string): Promise<Location> {
  //   // implement this
  // }
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
  id: number;
  name: string;
  region: {
    name: string;
    url: string;
  };
  names: {
     name: string;
     language: {
        name: string;
        url: string;
      }
  }[];
  game_indices: {
    game_index: number;
    generation: {
      name: string;
      url: string;
    }
  }[];
  areas: {
    name: string;
    url: string;
  }[];
};