export class PokeAPI {
  private static readonly baseURL = "https://pokeapi.co/api/v2";

  constructor() {}

  async fetchLocations(pageURL?: string): Promise<ShallowLocations> {
    const response = await fetch(pageURL ?? `${PokeAPI.baseURL}/location-area/`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();
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