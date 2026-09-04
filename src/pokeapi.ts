import { Cache } from "./pokecache.js";

export class PokeAPI {
  private static readonly baseURL = "https://pokeapi.co/api/v2";
  #cache: Cache;

  constructor(cacheInterval: number) {
    this.#cache = new Cache(cacheInterval);
  }

  closeCache() {
    this.#cache.stopReapLoop();
  }

  /**
   * Fetches and caches a URL, returning the cached value when one is present.
   * @param url the endpoint to request, also used as the cache key
   */
  async #fetch<T>(url: string): Promise<T> {
    const cached = this.#cache.get<T>(url);
    if (cached) {
      return cached;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data: T = await response.json();

    this.#cache.add(url, data);
    return data;
  }

  async fetchLocations(pageURL?: string): Promise<ShallowLocations> {
    return this.#fetch<ShallowLocations>(
      pageURL ?? `${PokeAPI.baseURL}/location-area/`,
    );
  }

  async fetchLocation(locationName: string): Promise<Location> {
    return this.#fetch<Location>(
      `${PokeAPI.baseURL}/location-area/${locationName}`,
    );
  }

  async fetchPokemon(pokemon: string): Promise<Pokemon> {
    return this.#fetch<Pokemon>(`${PokeAPI.baseURL}/pokemon/${pokemon}`);
  }
}

export type ShallowLocations = {
  count: number;
  next?: string;
  previous?: string;
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

export type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Array<{
    is_hidden: boolean;
    slot: number;
    ability: {
      name: string;
      url: string;
    };
  }>;
  past_abilities: Array<{
    generation: {
      name: string;
      url: string;
    };
    abilities: Array<{
      is_hidden: boolean;
      slot: number;
      // null where a generation removed the ability in that slot
      ability: {
        name: string;
        url: string;
      } | null;
    }>;
  }>;
  forms: Array<{
    name: string;
    url: string;
  }>;
  game_indices: Array<{
    game_index: number;
    version: {
      name: string;
      url: string;
    };
  }>;
  held_items: Array<{
    item: {
      name: string;
      url: string;
    };
    version_details: Array<{
      rarity: number;
      version: {
        name: string;
        url: string;
      };
    }>;
  }>;
  location_area_encounters: string;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
    version_group_details: Array<{
      level_learned_at: number;
      version_group: {
        name: string;
        url: string;
      };
      move_learn_method: {
        name: string;
        url: string;
      };
      // only set for ordered learn methods, null otherwise
      order: number | null;
    }>;
  }>;
  species: {
    name: string;
    url: string;
  };
  // every sprite slot is null when that artwork doesn't exist
  sprites: {
    other: {
      home: {
        front_shiny: string | null;
        front_female: string | null;
        front_default: string | null;
        front_shiny_female: string | null;
      };
      showdown: {
        back_shiny: string | null;
        back_female: string | null;
        front_shiny: string | null;
        back_default: string | null;
        front_female: string | null;
        front_default: string | null;
        back_shiny_female: string | null;
        front_shiny_female: string | null;
      };
      dream_world: {
        front_female: string | null;
        front_default: string | null;
      };
      "official-artwork": {
        front_shiny: string | null;
        front_default: string | null;
      };
    };
    versions: {
      "generation-i": {
        yellow: {
          back_gray: string | null;
          front_gray: string | null;
          back_default: string | null;
          front_default: string | null;
          back_transparent: string | null;
          front_transparent: string | null;
        };
        "red-blue": {
          back_gray: string | null;
          front_gray: string | null;
          back_default: string | null;
          front_default: string | null;
          back_transparent: string | null;
          front_transparent: string | null;
        };
      };
      "generation-v": {
        icons: {
          animated: {
            front_default: string | null;
          };
          front_default: string | null;
          front_female: string | null;
        };
        "black-white": {
          animated: {
            back_shiny: string | null;
            back_female: string | null;
            front_shiny: string | null;
            back_default: string | null;
            front_female: string | null;
            front_default: string | null;
            back_shiny_female: string | null;
            front_shiny_female: string | null;
          };
          back_shiny: string | null;
          back_female: string | null;
          front_shiny: string | null;
          back_default: string | null;
          front_female: string | null;
          front_default: string | null;
          back_shiny_female: string | null;
          front_shiny_female: string | null;
        };
      };
      "generation-ii": {
        gold: {
          back_shiny: string | null;
          front_shiny: string | null;
          back_default: string | null;
          front_default: string | null;
          front_transparent: string | null;
        };
        silver: {
          back_shiny: string | null;
          front_shiny: string | null;
          back_default: string | null;
          front_default: string | null;
          front_transparent: string | null;
        };
        crystal: {
          animated: {
            front_shiny: string | null;
            front_default: string | null;
          };
          back_shiny: string | null;
          front_shiny: string | null;
          back_default: string | null;
          front_default: string | null;
          back_transparent: string | null;
          front_transparent: string | null;
          back_shiny_transparent: string | null;
          front_shiny_transparent: string | null;
        };
      };
      "generation-iv": {
        platinum: {
          back_shiny: string | null;
          back_female: string | null;
          front_shiny: string | null;
          back_default: string | null;
          front_female: string | null;
          front_default: string | null;
          back_shiny_female: string | null;
          front_shiny_female: string | null;
        };
        "diamond-pearl": {
          back_shiny: string | null;
          back_female: string | null;
          front_shiny: string | null;
          back_default: string | null;
          front_female: string | null;
          front_default: string | null;
          back_shiny_female: string | null;
          front_shiny_female: string | null;
        };
        "heartgold-soulsilver": {
          back_shiny: string | null;
          back_female: string | null;
          front_shiny: string | null;
          back_default: string | null;
          front_female: string | null;
          front_default: string | null;
          back_shiny_female: string | null;
          front_shiny_female: string | null;
        };
      };
      "generation-ix": {
        "scarlet-violet": {
          front_female: string | null;
          front_default: string | null;
        };
      };
      "generation-vi": {
        "x-y": {
          front_shiny: string | null;
          front_female: string | null;
          front_default: string | null;
          front_shiny_female: string | null;
        };
        "omegaruby-alphasapphire": {
          front_shiny: string | null;
          front_female: string | null;
          front_default: string | null;
          front_shiny_female: string | null;
        };
      };
      "generation-iii": {
        emerald: {
          front_shiny: string | null;
          front_default: string | null;
        };
        "ruby-sapphire": {
          back_shiny: string | null;
          front_shiny: string | null;
          back_default: string | null;
          front_default: string | null;
        };
        "firered-leafgreen": {
          back_shiny: string | null;
          front_shiny: string | null;
          back_default: string | null;
          front_default: string | null;
        };
      };
      "generation-vii": {
        icons: {
          front_female: string | null;
          front_default: string | null;
        };
        "ultra-sun-ultra-moon": {
          front_shiny: string | null;
          front_female: string | null;
          front_default: string | null;
          front_shiny_female: string | null;
        };
      };
      "generation-viii": {
        icons: {
          front_female: string | null;
          front_default: string | null;
        };
        "brilliant-diamond-shining-pearl": {
          front_female: string | null;
          front_default: string | null;
        };
      };
    };
    back_shiny: string | null;
    back_female: string | null;
    front_shiny: string | null;
    back_default: string | null;
    front_female: string | null;
    front_default: string | null;
    back_shiny_female: string | null;
    front_shiny_female: string | null;
  };
  cries: {
    latest: string;
    legacy: string | null;
  };
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  past_stats: Array<{
    generation: {
      name: string;
      url: string;
    };
    stats: Array<{
      base_stat: number;
      effort: number;
      stat: {
        name: string;
        url: string;
      };
    }>;
  }>;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  past_types: Array<{
    generation: {
      name: string;
      url: string;
    };
    types: Array<{
      slot: number;
      type: {
        name: string;
        url: string;
      };
    }>;
  }>;
};
